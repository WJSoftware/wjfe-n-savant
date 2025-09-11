import { setLocation } from "./core/Location.js";
import { LocationFull } from "./core/LocationFull.js";
import { LocationLite } from "./core/LocationLite.svelte.js";
import { resetLogger, setLogger } from "./core/Logger.js";
import { resetRoutingOptions, routingOptions } from "./core/options.js";
import { resetTraceOptions, setTraceOptions } from "./core/trace.svelte.js";
import type { InitOptions, Location } from "./types.js";

function initInternal(options: InitOptions, location: Location) {
    setTraceOptions(options?.trace);
    setLogger(options?.logger ?? true);
    routingOptions.hashMode = options?.hashMode ?? routingOptions.hashMode;
    routingOptions.implicitMode = options?.implicitMode ?? routingOptions.implicitMode;
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
    return initInternal(options ?? {}, new LocationLite());
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
    return initInternal(options ?? {}, new LocationFull());
}
