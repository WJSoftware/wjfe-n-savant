<script lang="ts">
	import { location } from '$lib/core/Location.js';
	import { joinPaths, resolveHashValue } from '$lib/core/RouterEngine.svelte.js';
	import { getRouterContext } from '$lib/Router/Router.svelte';
	import { type Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	type Props = HTMLAnchorAttributes & {
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
		 * Configures the link so it replaces the current URL as opposed to pushing the URL as a new entry in the 
		 * browser's History API.
		 */
		replace?: boolean;
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
		activeState?: {
			/**
			 * Sets the route key that the link will use to determine if it should render as active.
			 */
			key?: string;
			/**
			 * Sets the class that the link will use when rendering as active.
			 * 
			 * For example, set it to `"active"` for Bootstrap setups.
			 */
			class?: string;
			/**
			 * Sets the style that the link will use when rendering as active.
			 * 
			 * This can be a string of CSS styles or an object of key-value pairs.
			 */
			style?: HTMLAnchorAttributes['style'] | Record<string, string>;
			/**
			 * Sets the value of the `aria-current` attribute when the link is active.
			 * 
			 * The possible values are defined by the HTML specification.
			 * 
			 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current#values)
			 */
			ariaCurrent?: HTMLAnchorAttributes['aria-current'];
		};
		/**
		 * Configures the component to prepend the parent router's base path to the `href` property.
		 * 
		 * This is recommended to achieve path independence in the application.  If, say, a NavBar component contains 
		 * links to different parts of the application, and this is a reusable component or a micro-frontend, then the 
		 * Link components inside the NavBar will inherit whatever route the controller shell has assigned to the 
		 * instance of the NavBar.
		 * 
		 * **IMPORTANT**:  This only works if the component is within a `Router` component.
		 */
		prependBasePath?: boolean;
		/**
		 * Renders the children of the component.
		 */
		children?: Snippet;
	};

	let {
		hash,
		href,
		replace = false,
		state,
		activeState,
		class: cssClass,
		style,
		prependBasePath = false,
		children,
		...restProps
	}: Props = $props();

	const router = getRouterContext(resolveHashValue(hash));

	let isActive = $derived(!!router?.routeStatus[activeState?.key ?? '']?.match);
	let calcHref = $derived(prependBasePath ? joinPaths(router?.basePath ?? '', href) : href);

	function handleClick(event: MouseEvent) {
		event.preventDefault();
		const newState = typeof state === 'function' ? state() : state;
		if (typeof hash === 'string') {
			location.navigate(calcHref, hash, { replace, state: newState });
		}
		else {
			location.navigate(!!hash ? `#${calcHref}` : calcHref, { replace, state: newState });
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
