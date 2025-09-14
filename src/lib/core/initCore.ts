import type { InitOptions, Location } from "$lib/types.js";
import { setLocation } from "./Location.js";
import { resetLogger, setLogger } from "./Logger.js";
import { resetRoutingOptions, setRoutingOptions } from "./options.js";
import { resetTraceOptions, setTraceOptions } from "./trace.svelte.js";

/**
 * Core initialization function used by both the main package and extension packages.
 * This ensures consistent initialization logic across different environments.
 * 
 * Extension packages must use this function to provide their own Location implementations
 * (e.g., SvelteKit-compatible implementations) while maintaining consistent setup.
 * 
 * @param options Initialization options for the routing library
 * @param location The Location implementation to use
 * @returns A cleanup function that reverts the initialization process
 */
export function initCore(location: Location, options?: InitOptions) {
    if (!location) {
        throw new Error("A valid location object must be provided to initialize the routing library.");
    }
    setTraceOptions(options?.trace);
    setLogger(options?.logger ?? true);
    setRoutingOptions(options);
    const newLocation = setLocation(location);
    return () => {
        newLocation?.dispose();
        setLocation(null);
        resetRoutingOptions();
        resetLogger();
        resetTraceOptions();
    };
}
