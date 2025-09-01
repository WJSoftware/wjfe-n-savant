<script lang="ts" module>
	import type { PreserveQuery } from '$lib/types.js';
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
	};

	class _LinkContext implements ILinkContext {
		replace = $state(false);
		prependBasePath = $state(false);
		preserveQuery = $state<ILinkContext['preserveQuery']>(false);

		constructor(
			replace: boolean,
			prependBasePath: boolean,
			preserveQuery: ILinkContext['preserveQuery']
		) {
			this.replace = replace;
			this.prependBasePath = prependBasePath;
			this.preserveQuery = preserveQuery;
		}
	}

	const linkCtxKey = Symbol();

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
		replace = false,
		prependBasePath = false,
		preserveQuery = false,
		children,
	}: Props = $props();

	const parentContext = getLinkContext();
	const context = new _LinkContext(
		parentContext?.replace ?? replace,
		parentContext?.prependBasePath ?? prependBasePath,
		parentContext?.preserveQuery ?? preserveQuery
	);

	setContext(linkCtxKey, context);

	$effect.pre(() => {
		context.prependBasePath = prependBasePath;
		context.replace = replace;
		context.preserveQuery = preserveQuery;
	});
</script>

{@render children?.()}
