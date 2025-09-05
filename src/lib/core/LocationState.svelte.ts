import { SvelteURL } from "svelte/reactivity";
import { isConformantState } from "./isConformantState.js";
import type { State } from "$lib/types.js";

/**
 * Base class for implementations of HistoryApi classes.
 */
export class LocationState {
    #url;
    state;

    constructor(initialHref?: string, initialState?: State) {
        this.#url = new SvelteURL(initialHref || globalThis.window?.location?.href);
        // Get the current state from History API
        let historyState = initialState ?? globalThis.window?.history?.state;
        let validState = false;
        this.state = $state((validState = isConformantState(historyState)) ? historyState : { path: undefined, hash: {} });
        if (!validState && historyState != null) {
            console.warn('Non-conformant state data detected in History API. Resetting to clean state.');
        }
    }

    get url() {
        return this.#url;
    }
}
