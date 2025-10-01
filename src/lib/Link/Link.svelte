<script lang="ts">
	import { calculateHref } from '$lib/core/calculateHref.js';
	import { calculateState } from '$lib/core/calculateState.js';
	import { location } from '$lib/core/Location.js';
	import { resolveHashValue } from '$lib/core/resolveHashValue.js';
	import { getLinkContext, type ILinkContext } from '$lib/LinkContext/LinkContext.svelte';
	import { isRouteActive } from '$lib/public-utils.js';
	import { getRouterContext } from '$lib/Router/Router.svelte';
	import type { ActiveState, Hash, RouteStatus } from '$lib/types.js';
	import { assertAllowedRoutingMode, joinStyles } from '$lib/utils.js';
	import { type Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	type Props = HTMLAnchorAttributes &
		ILinkContext & {
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
			 * 	   <Link {hash} />
			 * {/key}
			 * ```
			 *
			 * Unlike other components, the `Link` component does not need a parent router to function.  It can be used
			 * anywhere in the application.  The following features, however, will not work:
			 *
			 * - The `activeState` property:  It depends on the parent router to set its active state reactively when a
			 * route becomes active.
			 * - The `prependBasePath` property:  It depends on the parent router to set the base path for the link.
			 */
			hash?: Hash;
			/**
			 * Sets the URL to navigate to.  Never use a full URL; always use relative or absolute paths.
			 */
			href: string;
			/**
			 * Sets the state object to pass to the browser's History API when pushing or replacing the URL.
			 *
			 * If a function is provided, it will be called and its return value will be used as the state object.
			 */
			state?: any;
			/**
			 * Sets the various options that are used to automatically style the anchor tag whenever a particular route
			 * becomes active.
			 *
			 * **IMPORTANT**:  This only works if the component is within a `Router` component.
			 */
			activeState?: ActiveState;
			/**
			 * Renders the children of the component.
			 * @param state The state object stored in in the window's History API for the universe the link is
			 * associated to.
			 * @param routeStatus The router's route status data, if the `Link` component is within the context of a
			 * router.
			 */
			children?: Snippet<[any, Record<string, RouteStatus> | undefined]>;
		};

	let {
		hash,
		href,
		replace,
		state,
		activeState,
		class: cssClass,
		style,
		prependBasePath,
		preserveQuery,
		children,
		onclick: incomingOnclick,
		...restProps
	}: Props = $props();

	const resolvedHash = resolveHashValue(hash);
	assertAllowedRoutingMode(resolvedHash);
	const router = getRouterContext(resolvedHash);
	const linkContext = getLinkContext();
	const calcReplace = $derived(replace ?? linkContext?.replace ?? false);
	const calcPreserveQuery = $derived(preserveQuery ?? linkContext?.preserveQuery ?? false);
	const calcPrependBasePath = $derived(prependBasePath ?? linkContext?.prependBasePath ?? false);
	const isActive = $derived(isRouteActive(router, activeState?.key));
	const calcHref = $derived(
		calculateHref(
			{
				hash: resolvedHash,
				preserveQuery: calcPreserveQuery
			},
			calcPrependBasePath ? router?.basePath : undefined,
			href
		)
	);

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLAnchorElement }) {
		incomingOnclick?.(event);
		if (event.defaultPrevented) return;
		event.preventDefault();
		const newState = calculateState(resolvedHash, typeof state === 'function' ? state() : state);
		location.goTo(calcHref, { state: newState, replace: calcReplace });
	}
</script>

<a
	href={calcHref}
	class={[cssClass, (isActive && activeState?.class) || undefined]}
	style={isActive ? joinStyles(style, activeState?.style) : style}
	aria-current={isActive ? (activeState?.ariaCurrent ?? 'page') : undefined}
	onclick={handleClick}
	{...restProps}
>
	{@render children?.(location.getState(resolvedHash), router?.routeStatus)}
</a>
