import { setLocation } from "./core/Location.js";
import { LocationFull } from "./core/LocationFull.js";
import { LocationLite } from "./core/LocationLite.svelte.js";
import { resetLogger, setLogger } from "./core/Logger.js";
import { resetRoutingOptions, routingOptions, setRoutingOptions } from "./core/options.js";
import { resetTraceOptions, setTraceOptions } from "./core/trace.svelte.js";
import type { InitOptions, Location } from "./types.js";

/**
 * Core initialization function used by both the main package and extension packages.
 * This ensures consistent initialization logic across different environments.
 * 
 * Extension packages can use this function to provide their own Location implementations
 * (e.g., SvelteKit-compatible implementations) while maintaining consistent setup.
 * 
 * @param options Initialization options for the routing library
 * @param location The Location implementation to use
 * @returns A cleanup function that reverts the initialization process
 */
export function initCore(options: InitOptions, location: Location) {
    setTraceOptions(options?.trace);
    setLogger(options?.logger ?? true);
    setRoutingOptions({
        hashMode: options?.hashMode,
        implicitMode: options?.implicitMode
    });
    const newLocation = setLocation(location);
    return () => {
        newLocation?.dispose();
        setLocation(null);
        resetRoutingOptions();
        resetLogger();
        resetTraceOptions();
    };
}

/**
 * Initializes the routing library in normal mode.  The following features are available:
 * 
 * - URL and state tracking
 * - Navigation
 * - Event handling of the `popstate` and `hashchange` events
 * - Routers
 * - Routes
 * - Links
 * - Fallbacks
 * - Link contexts
 * 
 * Use `initFull()` to enable the following features:
 * - Raising the `beforeNavigate` and `navigationCancelled` events
 * - Intercepting navigation from other libraries or routers
 * 
 * @returns A cleanup function that reverts the initialization process.
 */
export function init(options?: InitOptions) {
    return initCore(options ?? {}, new LocationLite());
}

/**
 * Initializes the routing library in full mode. All features of normal mode are available, plus the following:
 * 
 * - Raising the `beforeNavigate` and `navigationCancelled` events
 * - Intercepting navigation from other libraries or routers
 * 
 * @returns A cleanup function that reverts the initialization process.
 */
export function initFull(options?: InitOptions) {
    return initCore(options ?? {}, new LocationFull());
}
