<script lang="ts">
	import { location } from '$lib/core/Location.js';
	import { joinPaths, resolveHashValue } from '$lib/core/RouterEngine.svelte.js';
	import { getLinkContext, type ILinkContext } from '$lib/LinkContext/LinkContext.svelte';
	import { getRouterContext } from '$lib/Router/Router.svelte';
	import type { ActiveState } from '$lib/types.js';
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
			hash?: boolean | string;
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
			 */
			children?: Snippet;
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
		...restProps
	}: Props = $props();

	const router = getRouterContext(resolveHashValue(hash));
	const linkContext = getLinkContext();

	const calcReplace = $derived(replace ?? linkContext?.replace ?? false);
	const calcPreserveQuery = $derived(preserveQuery ?? linkContext?.preserveQuery ?? false);
	const calcPrependBasePath = $derived(prependBasePath ?? linkContext?.prependBasePath ?? false);
	const isActive = $derived(!!router?.routeStatus[activeState?.key ?? '']?.match);
	const calcHref = $derived(buildHref());

	function buildHref() {
		const pathname = calcPrependBasePath ? joinPaths(router?.basePath ?? '', href) : href;
		if (hash || !calcPreserveQuery || !location.url.searchParams.size) {
			return pathname;
		}
		let searchParams: URLSearchParams;
		if (calcPreserveQuery === true) {
			searchParams = location.url.searchParams;
		} else {
			searchParams = new URLSearchParams();
			const transferValue = (key: string) => {
				const value = location.url.searchParams.getAll(key);
				if (value) {
					value.forEach((v) => searchParams.append(key, v));
				}
			};
			if (Array.isArray(calcPreserveQuery)) {
				for (let key of calcPreserveQuery) {
					transferValue(key);
				}
			} else {
				transferValue(calcPreserveQuery);
			}
		}
		return `${pathname}?${searchParams}`;
	}

	function handleClick(event: MouseEvent) {
		event.preventDefault();
		const newState = typeof state === 'function' ? state() : state;
		if (typeof hash === 'string') {
			location.navigate(calcHref, hash, { replace: calcReplace, state: newState });
		} else {
			location.navigate(!!hash ? `#${calcHref}` : calcHref, {
				replace: calcReplace,
				state: newState
			});
		}
	}

	function styleString() {
		let baseStyle = style ? style.trim() : '';
		if (baseStyle && !baseStyle.endsWith(';')) {
			baseStyle += ';';
		}
		if (!activeState?.style) {
			return baseStyle || undefined;
		}
		if (typeof activeState.style === 'string') {
			return baseStyle ? `${baseStyle} ${activeState.style}` : activeState.style;
		}
		const calculatedStyle = Object.entries(activeState.style)
			.map(([key, value]) => `${key}: ${value}`)
			.join('; ');
		return baseStyle ? `${baseStyle} ${calculatedStyle}` : calculatedStyle;
	}
</script>

<a
	href={calcHref}
	class={[cssClass, { [activeState?.class ?? '']: isActive }]}
	style={isActive ? styleString() : undefined}
	aria-current={isActive ? (activeState?.ariaCurrent ?? 'page') : undefined}
	onclick={handleClick}
	{...restProps}
>
	{@render children?.()}
</a>
