import type { RoutingOptions } from "$lib/types.js";

/**
 * Default routing options used for rollback.
 */
const defaultRoutingOptions: Required<RoutingOptions> = {
    hashMode: 'single',
    implicitMode: 'path',
};

/**
 * Global routing options.
 */
export const routingOptions: Required<RoutingOptions> = structuredClone(defaultRoutingOptions);

/**
 * Resets routing options to their default values.
 */
export function resetRoutingOptions(): void {
    Object.assign(routingOptions, structuredClone(defaultRoutingOptions));
}
