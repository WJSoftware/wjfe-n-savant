<script lang="ts" module>
	export type ParamName<T> = T extends `${infer P}?` ? P : T;
	/**
	 * Extracts the parameters from a route pattern.
	 */
	export type RouteParameters<T> = T extends string
		? T extends `${string}:${infer Param}/${infer Rest}`
			? ParamName<Param> | RouteParameters<Rest>
			: T extends `${string}:${infer Param}`
				? ParamName<Param>
				: T extends `${string}/*`
					? 'rest'
					: T extends '*'
						? 'rest'
						: never
		: string;
</script>

<script lang="ts" generics="T extends string | RegExp">
	import { untrack, type Snippet } from 'svelte';
	import { getRouterContext } from '../Router/Router.svelte';
	import { resolveHashValue } from '$lib/core/RouterEngine.svelte.js';
	import type { ParameterValue, RouteStatus } from '$lib/types.js';

	type Props = {
		/**
		 * Sets the route's unique key.
		 *
		 * Note that uniqueness is not really enforced, but it is assumed.  Make sure you don't duplicate keys in your
		 * routes, or that you only do it to create disconnected UI pieces that come up under the same routing
		 * conditions.
		 */
		key: string;
		/**
		 * Sets the route's path pattern, or a regular expression used to test and match the browser's URL.
		 *
		 * ## Patterns
		 *
		 * Patterns are strings that can contain parameters.  Parameters are defined by a colon followed by the
		 * parameter's name.  For example, the pattern `'/user/:id'` will match `'/user/123'`, `'/user/abc'`, etc.  The
		 * parameter's value will be stored in the `params` property of the `Route` component.
		 *
		 * The parameters are also made available to the children of the route component via the snippet's first argument.
		 *
		 * ### Rest Parameter
		 *
		 * You can use a rest parameter to capture the rest of the URL.  For example, the pattern `'/user/:id/*'` will
		 * match `'/user/123/abc/def'`, and the `rest` parameter will be `'/abc/def'`.
		 *
		 * Because pattern matching is always **exact**, a rest parameter can be used to attain "starts with" matching.
		 *
		 * ## Regular Expressions
		 *
		 * If a regular expression is used, it must comply with the following rules:
		 *
		 * 1. The regular expression must produce a single match (when it matches).
		 * 2. The regular expression must use named capture groups for parameter detection.  The names of the capture
		 * groups will be used as the parameter names.
		 *
		 * **IMPORTANT**:  A route without `path` or `amd` is not registered in the router.
		 */
		path?: T;
		/**
		 * Sets a function for additional matching conditions.
		 * @param params The route's parameters, if any.
		 * @returns `true` if the route should match, or `false` otherwise.
		 *
		 * This function is only called if the route's pattern or regular expression matches the URL.
		 *
		 * **IMPORTANT**:  A route without `path` or `amd` is not registered in the router.
		 */
		and?: (params: Record<RouteParameters<T>, ParameterValue> | undefined) => boolean;
		/**
		 * Sets a function for additional matching conditions.
		 *
		 * Use this one when you need to match based on the final status of all routes.
		 * @param routeStatus The router's route status object.
		 * @returns `true` if the route should match, or `false` otherwise.
		 *
		 * This is shorthand for:
		 *
		 * ```svelte
		 * {#if when(router.routeStatus)}
		 *     <Route ...>...</Route>
		 * {/if}
		 * ```
		 *
		 *
		 * In other words, use it to further condition rendering based on the final status of all routes.
		 *
		 * Example:  Match only if the home route did not:
		 *
		 * ```svelte
		 * <Route key="notHome" when={({ home }) => !home.match}>
		 *    <NotHome />
		 * </Route>
		 * ```
		 */
		when?: (routeStatus: Record<string, RouteStatus>) => boolean;
		/**
		 * Sets whether the route's path pattern should be matched case-sensitively.
		 *
		 * This has no effect if `path` is a regular expression.
		 */
		caseSensitive?: boolean;
		/**
		 * Sets the hash mode of the route.
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
		 * 	   <Route {hash} />
		 * {/key}
		 * ```
		 */
		hash?: boolean | string;
		/**
		 * Bindable.  Provides a way to obtain a route's parameters through property binding.  The binding is
		 * write-only, so incoming changes have no effect.
		 */
		params?: Record<RouteParameters<T>, ParameterValue>;
		/**
		 * Renders the children of the route.
		 * @param params The route's parameters.
		 */
		children?: Snippet<[Record<RouteParameters<T>, ParameterValue> | undefined]>;
	};

	let {
		key,
		path,
		and,
		when,
		caseSensitive = false,
		hash,
		params = $bindable(),
		children
	}: Props = $props();

	const router = getRouterContext(resolveHashValue(hash));
	if (!router) {
		throw new Error(
			'Route components must be used inside a Router component that matches the hash setting.'
		);
	}

	// Effect that updates the route object in the parent router.
	$effect.pre(() => {
		if (!path && !and && !when) {
			return;
		}
		// svelte-ignore ownership_invalid_mutation
		untrack(() => router.routes)[key] =
			path instanceof RegExp
				? { regex: path, and, when }
				: {
						pattern: path,
						and,
						when,
						caseSensitive
					};
		return () => {
			// svelte-ignore ownership_invalid_mutation
			delete untrack(() => router.routes)[key];
		};
	});
	// Effect that synchronizes the params property with the calculated params.
	$effect.pre(() => {
		params = router.routeStatus[key]?.routeParams;
	});
</script>

{#if (router.routeStatus[key]?.match ?? true) && (untrack(() => router.routes)[key]?.when?.(router.routeStatus) ?? true)}
	{@render children?.(params)}
{/if}
