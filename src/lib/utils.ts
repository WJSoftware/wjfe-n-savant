import type { ActiveState, Hash } from "./types.js";
import { routingOptions } from "./core/options.js";
import type { HTMLAnchorAttributes } from "svelte/elements";

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

/**
 * Joins two style definitions into a single style definition.
 * 
 * @param startingStyle The base style definition.
 * @param addedStyle The style definition to add to the base style definition.
 * @returns The combined style definition, or `undefined` if both inputs are empty or `undefined`.
 */
export function joinStyles(
    startingStyle: HTMLAnchorAttributes["style"],
    addedStyle: ActiveState["style"],
): string | undefined {
    let baseStyle = startingStyle ? startingStyle.trim() : '';
    if (baseStyle && !baseStyle.endsWith(';')) {
        baseStyle += ';';
    }
    if (!addedStyle) {
        return baseStyle || undefined;
    }
    if (typeof addedStyle === 'string') {
        return baseStyle ? `${baseStyle} ${addedStyle}` : addedStyle;
    }
    const calculatedStyle = Object.entries(addedStyle)
        .reduce((acc, [key, value]) => acc += `${key}: ${value}; `, '');
    return baseStyle ? `${baseStyle} ${calculatedStyle}` : calculatedStyle;
}
