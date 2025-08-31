import type { Location, State } from "$lib/types.js";

/**
 * Internal symbol for accessing complete state from Location implementations.
 * This provides access to the full state object for internal library operations
 * without expanding the public API surface.
 */
export const getCompleteStateKey = Symbol('getCompleteState');

/**
 * Global location object.  Use it to monitor or reactively react to URL or state changes.  It also provides the 
 * `navigate` method to programmatically navigate to a new URL, which allows setting the state as well.
 * 
 * **IMPORTANT**: This object is only available after the application has been initialized with `init`.
 */
export let location: Location;

export function setLocation(newLocation: Location | null) {
    if (newLocation && location) {
        throw new Error("Cannot override the current location object.  Clean the existing location first.");
    }
    // @ts-expect-error Purposely not typed as nullable for simplicity of use.
    return location = newLocation;
}
