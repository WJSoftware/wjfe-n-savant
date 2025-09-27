import type { Hash } from "./types.js";
import { routingOptions } from "./core/options.js"; 

/**
 * Asserts that the specified routing mode is allowed by the current routing options.
 * 
 * @param hash The routing mode to assert.
 * @throws If the specified routing mode is disallowed by the current routing options.
 */
export function assertAllowedRoutingMode(hash: Hash) {
    if (hash === false && routingOptions.disallowPathRouting) {
        throw new Error("Path routing has been disallowed by a library extension.");
    }
    if (hash === true && routingOptions.disallowHashRouting) {
        throw new Error("Hash routing has been disallowed by a library extension.");
    }
    if (typeof hash === 'string' && routingOptions.disallowMultiHashRouting) {
        throw new Error("Multi-hash routing has been disallowed by a library extension.");
    }
}
