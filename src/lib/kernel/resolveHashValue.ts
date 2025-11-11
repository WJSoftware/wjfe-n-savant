import type { Hash } from "$lib/types.js";
import { routingOptions } from "./options.js";

/**
 * Resolves the given hash value taking into account the library's routing options.
 * @param hash Hash value to resolve.
 * @returns The resolved hash value.
 */
export function resolveHashValue(hash: Hash | undefined): Hash {
    if (hash === undefined) {
        return routingOptions.defaultHash;
    }
    return hash;
}
