<script lang="ts">
	import { resolveHashValue } from '$lib/core/RouterEngine.svelte.js';
	import { getRouterContext } from '$lib/Router/Router.svelte';
	import type { RouteStatus } from '$lib/types.js';
	import type { Snippet } from 'svelte';

	type Props = {
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
		 * 	   <Fallback {hash} />
		 * {/key}
		 * ```
		 */
		hash?: boolean | string;
		/**
		 * Renders the children of the component.
		 *
		 * This rendering is conditioned to the parent router engine's `noMatches` property being `true`.  This means
		 * that the children will only be rendered when no route matches the current location.
		 * @param state The state object stored in in the window's History API for the universe the fallback component 
		 * is associated to.
		 * @param routeStatus The router's route status data.
		 */
		children?: Snippet<[any, Record<string, RouteStatus>]>;
	};

	let { hash, children }: Props = $props();

	const router = getRouterContext(resolveHashValue(hash));
</script>

{#if router?.noMatches}
	{@render children?.(router.state, router.routeStatus)}
{/if}
