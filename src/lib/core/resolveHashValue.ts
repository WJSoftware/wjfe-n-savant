import { routingOptions } from "./options.js";

/**
 * Resolves the given hash value taking into account the library's routing options.
 * @param hash Hash value to resolve.
 * @returns The resolved hash value.
 */
export function resolveHashValue(hash: boolean | string | undefined) {
    if (hash === undefined) {
        return routingOptions.implicitMode === 'hash';
    }
    return hash;
}
