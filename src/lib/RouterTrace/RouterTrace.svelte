<script lang="ts">
	import { traceOptions, getAllChildRouters } from '$lib/core/trace.svelte.js';
	import {
		resolveHashValue,
		routePatternsKey,
		RouterEngine
	} from '$lib/core/RouterEngine.svelte.js';
	import { getRouterContext } from '$lib/Router/Router.svelte';
	import type { PatternRouteInfo } from '$lib/types.js';
	import type { HTMLTableAttributes } from 'svelte/elements';

	type Props = Omit<HTMLTableAttributes, 'children'> & {
		/**
		 * Sets the hash mode of the component.
		 *
		 * If `true`, the component will search for the immediate parent router configured for single hash routing.
		 *
		 * If a string, the component will search for the immediate parent router configured for multi hash routing
		 * that matches the string.
		 *
		 * If `false`, the component will search for the immediate parent router configured for path routing.
		 *
		 * If left undefined, it will resolve to one of the previous values based on the `implicitMode` routing option.
		 *
		 * **IMPORTANT**:  Because the hash value directly affects the search for the parent router, it cannot be
		 * reactively set to different values at will.  If you must do this, destroy and recreate the component
		 * whenever the hash changes:
		 *
		 * @example
		 * ```svelte
		 * {#key hash}
		 * 	   <RouterTrace {hash} />
		 * {/key}
		 * ```
		 *
		 * Unlike other components, the `RouterTrace` component does not need a hash value if a router engine object is
		 * provided in its stead via the `router` property.
		 */
		hash?: boolean | string;
		/**
		 * Sets the router engine to trace.
		 */
		router?: RouterEngine;
		/**
		 * Sets the position of the router engine's children menu.
		 */
		childrenMenuPosition?: 'top' | 'bottom';
	};

	let {
		hash,
		router = $bindable(),
		childrenMenuPosition = 'top',
		class: cssClass,
		...restProps
	}: Props = $props();

	if (!router) {
		router = getRouterContext(resolveHashValue(hash));
		if (!router) {
			throw new Error(
				'There is no router to trace.  Make sure a Router component is an ancestor of this RouterTrace component instance, or provide a router using the "router" property.'
			);
		}
	}
	const routePatterns = $derived(router[routePatternsKey]());
	// Child routers picker snippet
	const childRouterRefs = $derived(traceOptions.routerHierarchy ? getAllChildRouters(router) : []);
	let showChildrenMenu = $state(false);
</script>

{#snippet childRoutersPicker()}
	<div class="children-picker">
		<button type="button" onclick={() => (showChildrenMenu = !showChildrenMenu)}>
			Children: {childRouterRefs.length}
		</button>
		{#if showChildrenMenu}
			<ul class={['children-menu', `children-menu-${childrenMenuPosition}`]}>
				{#each childRouterRefs as ref}
					{@const childRouter = ref.deref()}
					{#if childRouter}
						<li>
							<button type="button">
								<strong>{childRouter.id ?? '(no ID)'}</strong>&nbsp;-&nbsp;{childRouter.basePath}
							</button>
						</li>
					{:else}
						<li>
							<span>(router no longer available)</span>
						</li>
					{/if}
				{/each}
			</ul>
		{/if}
	</div>
{/snippet}

<table class={['minimal', cssClass]} {...restProps}>
	<caption>
		<div>
			<span>
				Router ID: <span class="router-property">{router.id ?? '(no ID)'}</span>
			</span>
			<span>
				Base Path: <span class="router-property">{router.basePath}</span>
			</span>
			{#if traceOptions.routerHierarchy && childRouterRefs.length > 0}
				<span>
					{@render childRoutersPicker()}
				</span>
			{/if}
		</div>
	</caption>
	<thead>
		<tr>
			<th>Route</th>
			<th>Path</th>
			<th>RegEx</th>
			<th>Matches?</th>
			<th>Route Params</th>
		</tr>
	</thead>
	<tbody>
		{#each Object.entries(router.routeStatus) as [key, status]}
			<tr>
				<td>{key}</td>
				{#if typeof (router.routes[key] as PatternRouteInfo).pattern === 'string'}
					<td>
						<pre>{(router.routes[key] as PatternRouteInfo).pattern}</pre>
					</td>
				{/if}
				<td colspan={typeof (router.routes[key] as PatternRouteInfo).pattern === 'string' ? 1 : 2}>
					<code>{routePatterns.get(key)?.regex}</code>
				</td>
				<td>
					<span class="minimal-icon" class:error={!status.match}>
						{#if status.match}
							✔
						{:else}
							✘
						{/if}
					</span>
				</td>
				<td>
					{#if status.routeParams && Object.keys(status.routeParams).length > 0}
						<dl>
							{#each Object.entries(status.routeParams) as [param, value]}
								<dt>{param}</dt>
								<dd>{value}</dd>
							{/each}
						</dl>
					{:else}
						<span>(no params)</span>
					{/if}
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style lang="scss">
	.minimal {
		width: 100%;
		border-collapse: collapse;

		& th,
		& td {
			border: 1px solid #ddd;
			padding: 8px;
		}

		& th {
			background-color: #f2f2f2;
			text-align: left;
		}

		& tr:nth-child(even) {
			background-color: #f9f9f9;
		}

		& tr:hover {
			background-color: #f1f1f1;
		}

		& td:has(> span.minimal-icon) {
			text-align: center;
		}

		& .error {
			color: #dc3545;
		}

		& caption {
			font-size: 0.9em;

			& > div {
				display: flex;
				flex-direction: row;
				gap: 1em;
				flex-wrap: nowrap;
				justify-content: start;
				align-items: baseline;
			}

			& span.router-property {
				font-weight: bold;
				margin-left: 0.5em;
				background-color: #f8f9fa;
			}

			& .children-picker {
				position: relative;

				& button {
					border: none;
					border-radius: 4px;
				}

				& .children-menu {
					position: absolute;
					left: 0;
					width: max-content;
					background-color: #f8f9fa;
					border: 1px solid #ddd;
					border-radius: 4px;
					padding: 0.5em 0;
					z-index: 1;
					display: flex;
					flex-direction: column;
					gap: 0.5em;
					box-shadow: 0.5em 0.5em 1em rgba(0, 0, 0, 0.1);

					& li {
						list-style: none;
						& button {
							border: none;
							background-color: transparent;
							padding: 0.25em;
						}
					}

					& li:hover,
					& li button:hover {
						background-color: #e9ecef;
					}

					&.children-menu-top {
						bottom: 0;
					}

					&.children-menu-bottom {
						top: 100%;
					}
				}
			}
		}
	}
</style>
