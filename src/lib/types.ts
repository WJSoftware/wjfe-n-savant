import type { HTMLAnchorAttributes } from "svelte/elements";
import type { SvelteURL } from "svelte/reactivity";

/**
 * Defines the data type of all `hash` properties found in almost all of the library's components.
 */
export type Hash = boolean | string;

/**
 * Defines the valid shape of the state object that must be in the windows History API at all times for proper 
 * operation of the library.
 */
export type State = {
    /**
     * Holds the state data associated to path routing.
     */
    path: any;
    /**
     * Holds the state data associated to hash routing.
     * 
     * For single (or traditional) hash routing, the value is stored using the `single` key.  For multi-hash routing, 
     * the value is stored using the hash identifier as the key.
     */
    hash: Record<string, any>;
}

/**
 * Defines the possible data types for route parameter values.
 */
export type ParameterValue = string | number | boolean;

/**
 * Defines the shape of the data generated by router engines regarding routes.
 */
export type RouteStatus = {
    /**
     * Indicates whether the route matches the current URL.
     */
    match: boolean;
    /**
     * Contains the route's parameters, if any.
     * 
     * This is only available if the route has matched.
     */
    routeParams?: Record<string, ParameterValue>;
}

/**
 * Defines the shape of predicate functions that are used to further test if a route should be matched.
 */
export type AndUntyped = (params: Record<string, ParameterValue> | undefined) => boolean;

/**
 * Defines the shape of predicate functions that are used to determine if the route contents should show based on the 
 * route status information of all routes in the router.
 */
export type WhenPredicate = (routeStatus: Record<string, RouteStatus>) => boolean

/**
 * Defines the core properties of a route definition.
 */
export type CoreRouteInfo = {
    /**
     * An optional predicate function that is used to further test if the route should be matched.
     */
    and?: AndUntyped;
    /**
     * An optional predicate function that is used to determine if the route contents should show based on the route 
     * status information of all routes in the router.
     */
    when?: WhenPredicate;
}

/**
 * Defines the shape of a route definition that is based on a regular expression.
 */
export type RegexRouteInfo = CoreRouteInfo & {
    /**
     * The regular expression that the URL's pathname must match.
     * 
     * Any capturing groups in the regular expression are treated as route parameters.
     */
    regex: RegExp;
};

/**
 * Defines the shape of a route definition that is based on a string pattern.
 */
export type PatternRouteInfo = CoreRouteInfo & {
    /**
     * The pattern that the URL's pathname must match.  It can contain route parameters in the form of `:paramName`.
     */
    pattern?: string;
    /**
     * Whether the pattern is case-sensitive.
     * @default false
     */
    caseSensitive?: boolean;
};

/**
 * Defines the shape of a route definition.
 */
export type RouteInfo = RegexRouteInfo | PatternRouteInfo;

/**
 * Defines the options that can be used when calling `Location.navigate`.
 */
export type NavigateOptions = {
    /**
     * Whether to replace the current URL in the history stack.
     * @default false
     */
    replace?: boolean;
    /**
     * The state object to associate with the new URL.
     */
    state?: any;
}

/**
 * Defines the capabilities of the location object, central for all routing functionality.
 */
export interface Location {
    /**
     * Gets a reactive URL object with the current window's URL.
     */
    readonly url: SvelteURL;
    /**
     * Gets the current hash path or paths, depending on how the library was initialized.
     * 
     * If the library was initialized with the `hashMode` option set to `single`, do 
     * `location.hashPaths.single` to obtain the one path.  If it was set to `multi`, do 
     * `location.hashPaths.<ID>`, where `<ID>` is the wanted path' identifier.
     */
    readonly hashPaths: Record<string, string>;
    /**
     * Gets the current state object associated with the current URL that responds to the given hash value.
     * @param hash The hash value to get the state for.
     */
    getState(hash: Hash): any;
    /**
     * Navigates to the specified URL.
     * 
     * It will push new URL's by default.  To instead replace the current URL, set the `replace` option to `true`.
     * @param url The URL to navigate to.  Use an empty string (`""`) to navigate to the current URL, a. k. a., shallow 
     * routing.
     * @param options Options for navigation.
     */
    navigate(url: string | URL, options?: NavigateOptions): void;
    /**
     * Navigates to the specified hash URL for the specified hash identifier.
     * @param url The URL that will be saved as hash.  Use an empty string (`""`) to navigate to the current URL, 
     * a. k. a., shallow routing.
     * @param hashId The hash identifier for the route to set.
     * @param options Options for navigation.
     */
    navigate(url: string | URL, hashId: string, options?: NavigateOptions): void;
    /**
     * Disposes of the location object, cleaning up any resources.
     */
    dispose(): void;
    /**
     * Adds an event listener for the `beforfeNavigate` event.
     * 
     * This event has the ability to cancel navigation by calling the `cancel` method on the event object.
     * 
     * **IMPORTANT:**  This is a feature only available when initializing the routing library with the 
     * {@link InitOptions.full} option.
     * @param event The event to listen for.
     * @param callback The callback to invoke when the event occurs.
     * @returns A function that removes the event listener.
     */
    on(event: 'beforeNavigate', callback: (event: BeforeNavigateEvent) => void): () => void;
    /**
     * Adds an event listener for the `navigationCancelled` event.
     * 
     * This event occurs when navigation is cancelled by a handler of the `beforeNavigate` event.
     * 
     * **IMPORTANT:**  This is a feature only available when initializing the routing library with the 
     * {@link InitOptions.full} option.
     * @param event The event to listen for.
     * @param callback The callback to invoke when the event occurs.
     * @returns A function that removes the event listener.
     */
    on(event: 'navigationCancelled', callback: (event: NavigationCancelledEvent) => void): () => void;
}

/**
 * Defines the events that can be listened for on the location object.
 */
export type Events = 'beforeNavigate' | 'navigationCancelled';

/**
 * Represents a navigation event.
 */
export type NavigationEvent = {
    /**
     * The URL that was specified for navigation.
     */
    url: string;
    /**
     * The state object that was specified along with the URL.
     */
    state: unknown;
    /**
     * The method of navigation that was used.
     */
    method: 'push' | 'replace';
}

/**
 * Represents an event that occurs before navigation takes place.
 */
export type BeforeNavigateEvent = NavigationEvent & {
    /**
     * Whether the navigation was cancelled by a previously-executed callback o the `beforeNavigate` 
     * event.
     */
    wasCancelled: boolean;
    /**
     * The reason that was specified when the event was cancelled.
     */
    cancelReason: any;
    /**
     * Cancels the navigation event.
     * @param cause The reason for cancelling the navigation.
     */
    cancel(cause?: any): void;
}

/**
 * Represents an event that occurs when navigation is cancelled.
 */
export type NavigationCancelledEvent = NavigationEvent & {
    cause: any;
};

/**
 * Defines the possible settings that can be set in `Link` components to control when they are considered active and 
 * how they look like when active.
 */
export type ActiveState = {
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
}
