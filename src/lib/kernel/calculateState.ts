import type { Hash, Location, State } from "../types.js";
import { location } from "./Location.js";
import { getCompleteStateKey } from "./Location.js";
import { resolveHashValue } from "./resolveHashValue.js";

type LocationInternal = Location & { [getCompleteStateKey]: () => State };

/**
 * Calculates the complete state object that should be set in the History API, setting the given state as the state of 
 * the implicit routing universe, making sure that all states for all other routing universes are preserved.
 * @param state The desired state for the given hash.
 */
export function calculateState(state: any): State;
/**
 * Calculates the state object that should be set for a given hash value, making sure that all states for all other 
 * routing universes are preserved.
 * @param hash The hash value associated with the state.
 * @param state The desired state for the given hash.
 * @returns The state object that should be set, accounting for all routing universes.
 */
export function calculateState(hash: Hash | undefined, state: any): State;
export function calculateState(hashOrState: any, state?: any): State {
    let hash: Hash;
    if (arguments.length === 1) {
        state = hashOrState;
        hash = resolveHashValue(undefined);
    }
    else {
        hash = resolveHashValue(hashOrState);
    }
    // Get a deep clone of the complete current state using the internal symbol method
    const newState = (location as LocationInternal)[getCompleteStateKey]();
    
    // Set the new state in the appropriate routing universe
    if (typeof hash === 'string') {
        newState.hash[hash] = state;
    }
    else if (hash) {
        newState.hash = { single: state };
    }
    else {
        // For path routing, set the path state
        newState.path = state;
    }
    
    return newState;
}
