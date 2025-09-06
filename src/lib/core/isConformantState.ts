import type { State } from "$lib/types.js";

/**
 * Tests the given state data to see if it conforms to the expected `State` structure.
 * 
 * Use this while in full mode and handling the `beforeNavigate` event, or in code that has to do with directly pushing 
 * state to the window's History API.
 * @param state State data to test.
 * @returns `true` if the state conforms to the expected `State` structure, or `false` otherwise.
 */
export function isConformantState(state: unknown): state is State {
    return typeof state === 'object'
        && state !== null
        && 'hash' in state
        && typeof state.hash === 'object'
        && state.hash !== null
        && !Array.isArray(state.hash);
}
