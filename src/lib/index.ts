import { setLocation } from "./core/Location.js";
import { LocationFull } from "./core/LocationFull.js";
import { LocationLite } from "./core/LocationLite.svelte.js";
import { routingOptions, type RoutingOptions } from "./core/options.js";
import { setTraceOptions, type TraceOptions } from "./core/trace.svelte.js";

/**
 * Library's initialization options.
 */
export type InitOptions = RoutingOptions & {
    /**
     * Tracing options that generally should be off for production builds.
     */
    trace?: TraceOptions;
}

/**
 * Initializes the routing library.  In normal mode, only the following features are available:
 * 
 * - URL and state tracking
 * - Navigation
 * - Event handling of the `popstate` event
 * - Routers
 * - Routes
 * - Links
 * 
 * Use `options.full` to enable the following features:
 * - Raising the `beforeNavigate` and `navigationCancelled` events
 * - Intercepting navigation from other libraries or routers
 */
export function init(options?: InitOptions): () => void {
    setTraceOptions(options?.trace);
    routingOptions.full = options?.full ?? routingOptions.full;
    routingOptions.hashMode = options?.hashMode ?? routingOptions.hashMode;
    routingOptions.implicitMode = options?.implicitMode ?? routingOptions.implicitMode;
    const newLocation = setLocation(options?.full ? new LocationFull() : new LocationLite());
    return () => {
        newLocation?.dispose();
        setLocation(null);
    };
}

export * from "$lib/Link/Link.svelte";
export { default as Link } from "$lib/Link/Link.svelte";
export { default as LinkContext } from "$lib/LinkContext/LinkContext.svelte";
export * from "$lib/Route/Route.svelte";
export { default as Route } from "$lib/Route/Route.svelte";
export { getRouterContext, setRouterContext } from "$lib/Router/Router.svelte";
export { default as Router } from "$lib/Router/Router.svelte";
export * from "$lib/Fallback/Fallback.svelte";
export { default as Fallback } from "$lib/Fallback/Fallback.svelte";
export type * from "./types.js";
export { location } from "./core/Location.js";
export * from './RouterTrace/RouterTrace.svelte';
export { default as RouterTrace } from './RouterTrace/RouterTrace.svelte';
