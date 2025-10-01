<script lang="ts" module>
	import type { ActiveState, PreserveQuery } from '$lib/types.js';
	import { getContext, setContext, type Snippet } from 'svelte';

	export type ILinkContext = {
		/**
		 * Configures the link so it replaces the current URL as opposed to pushing the URL as a new entry in the
		 * browser's History API.
		 */
		replace?: boolean;
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
		 * Configures the component to preserve the query string whenever it triggers navigation.
		 *
		 * This is useful when you have query string values that are controlled by components that are not changing
		 * with the route.  For example, a search component that is not part of the route but is used to filter the
		 * data displayed on the page.
		 *
		 * Set to `false` to not preserve the query string.
		 *
		 * Set to `true` to preserve the entire query string.
		 *
		 * Set to a string or an array of strings to preserve only the specified query string values.
		 */
		preserveQuery?: PreserveQuery;
		/**
		 * Sets the various options that are used to automatically style the anchor tag whenever a particular route
		 * becomes active.
		 *
		 * **IMPORTANT**:  This only works if the component is within a `Router` component.
		 */
		activeState?: ActiveState;
	};

	class _LinkContext implements ILinkContext {
		replace;
		prependBasePath;
		preserveQuery;
		activeState;

		constructor(replace: boolean | undefined, prependBasePath: boolean | undefined, preserveQuery: PreserveQuery | undefined, activeState: ActiveState | undefined) {
			this.replace = $state(replace);
			this.prependBasePath = $state(prependBasePath);
			this.preserveQuery = $state(preserveQuery);
			this.activeState = $state(activeState);
		}
	}

	export const linkCtxKey = Symbol();

	export function getLinkContext() {
		return getContext<ILinkContext | undefined>(linkCtxKey);
	}
</script>

<script lang="ts">
	type Props = ILinkContext & {
		/**
		 * Renders the children of the component.
		 */
		children?: Snippet;
	};

	let {
		replace,
		prependBasePath,
		preserveQuery,
		activeState,
		children
	}: Props = $props();

	const parentContext = getLinkContext();
	const context = new _LinkContext(
		replace ?? parentContext?.replace,
		prependBasePath ?? parentContext?.prependBasePath,
		preserveQuery ?? parentContext?.preserveQuery,
		activeState ?? parentContext?.activeState
	);

	setContext(linkCtxKey, context);

	$effect.pre(() => {
		context.prependBasePath = prependBasePath ?? parentContext?.prependBasePath;
		context.replace = replace ?? parentContext?.replace;
		context.preserveQuery = preserveQuery ?? parentContext?.preserveQuery;
		context.activeState = activeState ?? parentContext?.activeState;
	});
</script>

{@render children?.()}
