import type { ExtendedRoutingOptions } from "../types.js";

/**
 * Default routing options used for rollback.
 */
export const defaultRoutingOptions: Required<ExtendedRoutingOptions> = {
    hashMode: 'single',
    implicitMode: 'path',
    disallowPathRouting: false,
    disallowHashRouting: false,
    disallowMultiHashRouting: false,
};

/**
 * Global routing options.
 */
export const routingOptions: Required<ExtendedRoutingOptions> = structuredClone(defaultRoutingOptions);

/**
 * Sets routing options, merging with current values.
 * This function is useful for extension packages that need to configure routing options.
 * 
 * @param options Partial routing options to set
 */
export function setRoutingOptions(options?: Partial<ExtendedRoutingOptions>): void {
    routingOptions.hashMode = options?.hashMode ?? routingOptions.hashMode;
    routingOptions.implicitMode = options?.implicitMode ?? routingOptions.implicitMode;
    routingOptions.disallowPathRouting = options?.disallowPathRouting ?? routingOptions.disallowPathRouting;
    routingOptions.disallowHashRouting = options?.disallowHashRouting ?? routingOptions.disallowHashRouting;
    routingOptions.disallowMultiHashRouting = options?.disallowMultiHashRouting ?? routingOptions.disallowMultiHashRouting;
}

/**
 * Resets routing options to their default values.
 */
export function resetRoutingOptions(): void {
    Object.assign(routingOptions, structuredClone(defaultRoutingOptions));
}
