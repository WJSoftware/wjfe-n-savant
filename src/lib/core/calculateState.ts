import type { Hash, Location, State } from "$lib/types.js";
import { location } from "./Location.js";
import { getCompleteStateKey } from "./Location.js";

type LocationInternal = Location & { [getCompleteStateKey]: () => State };

/**
 * Calculates the state object that should be set for a given hash value, making sure that all states for all other 
 * routing universes are preserved.
 * @param hash The hash value associated with the state.
 * @param state The desired state for the given hash.
 * @returns The state object that should be set, accounting for all routing universes.
 */
export function calculateState(hash: Hash, state: any): State {
    // Get a deep clone of the complete current state using the internal symbol method
    const newState = (location as LocationInternal)[getCompleteStateKey]();
    
    // Set the new state in the appropriate routing universe
    if (typeof hash === 'string') {
        // For named hash routing (multi-hash mode), set the state for this specific hash name
        // Preserve all existing named hash universes by only setting the target one
        newState.hash[hash] = state;
    }
    else if (hash) {
        // For single hash routing (traditional mode), set the single hash state
        // NOTE: We do NOT preserve other named hash states as we're in traditional mode
        newState.hash = { single: state };
    }
    else {
        // For path routing, set the path state
        newState.path = state;
    }
    
    return newState;
}
