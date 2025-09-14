import { LocationFull } from "./core/LocationFull.js";
import { LocationLite } from "./core/LocationLite.svelte.js";
import type { InitOptions } from "./types.js";
import { initCore } from "./core/initCore.js";

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
    return initCore(new LocationLite(), options);
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
    return initCore(new LocationFull(), options);
}
