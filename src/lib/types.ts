import type { SvelteURL } from "svelte/reactivity";

/**
 * Defines the shape of predicate functions that are used to further test if a route should be matched.
 */
export type AndUntyped = (params: Record<string, string | number | boolean> | undefined) => boolean;

/**
 * Defines the shape of a route definition that is based on a regular expression.
 */
export type RegexRouteInfo = {
    /**
     * The regular expression that the URL's pathname must match.
     * 
     * Any capturing groups in the regular expression are treated as route parameters.
     */
    regex: RegExp;
    /**
     * An optional predicate function that is used to further test if the route should be matched.
     */
    and?: AndUntyped;
};

/**
 * Defines the shape of a route definition that is based on a string pattern.
 */
export type PatternRouteInfo = {
    /**
     * The pattern that the URL's pathname must match.  It can contain route parameters in the form of `:paramName`.
     */
    pattern?: string;
    /**
     * An optional predicate function that is used to further test if the route should be matched.
     */
    and?: AndUntyped;
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
     * Gets the current state object.
     */
    readonly state: any;
    /**
     * Gets the current hash path or paths, depending on how the library was initialized.
     * 
     * If the library was initialized with the `hashMode` option set to `single`, do 
     * `location.hashPaths.single` to obtain the one path.  If it was set to `multi`, do 
     * `location.hashPaths.<ID>`, where `<ID>` is the wanted path' identifier.
     */
    readonly hashPaths: Record<string, string>;
    /**
     * Navigates to the specified URL.
     * 
     * It will push new URL's by default.  To instead replace the current URL, set the `replace` option to `true`.
     * @param url The URL to navigate to.
     * @param options Options for navigation.
     */
    navigate(url: string | URL, options?: NavigateOptions): void;
    /**
     * Navigates to the specified hash URL for the specified hash identifier.
     * @param url The URL that will be saved as hash.
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
    state: any;
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
