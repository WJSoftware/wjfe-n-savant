import type { RoutingOptions } from "$lib/types.js";

/**
 * Default routing options used for rollback.
 */
export const defaultRoutingOptions: Required<RoutingOptions> = {
    hashMode: 'single',
    implicitMode: 'path',
};

/**
 * Global routing options.
 */
export const routingOptions: Required<RoutingOptions> = structuredClone(defaultRoutingOptions);

/**
 * Sets routing options, merging with current values.
 * This function is useful for extension packages that need to configure routing options.
 * 
 * @param options Partial routing options to set
 */
export function setRoutingOptions(options?: Partial<RoutingOptions>): void {
    routingOptions.hashMode = options?.hashMode ?? routingOptions.hashMode;
    routingOptions.implicitMode = options?.implicitMode ?? routingOptions.implicitMode;
}

/**
 * Resets routing options to their default values.
 */
export function resetRoutingOptions(): void {
    Object.assign(routingOptions, structuredClone(defaultRoutingOptions));
}
