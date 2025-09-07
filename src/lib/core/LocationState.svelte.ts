import { SvelteURL } from "svelte/reactivity";
import { isConformantState } from "./isConformantState.js";
import { logger } from "./Logger.js";

/**
 * Helper class used to manage the reactive data of Location implementations.
 */
export class LocationState {
    url = new SvelteURL(globalThis.window?.location?.href);
    state;

    constructor() {
        // Get the current state from History API
        let historyState = globalThis.window?.history?.state;
        let validState = false;
        this.state = $state((validState = isConformantState(historyState)) ? historyState : { path: undefined, hash: {} });
        if (!validState && historyState != null) {
            logger.warn('Non-conformant state data detected in History API. Resetting to clean state.');
        }
    }
}
