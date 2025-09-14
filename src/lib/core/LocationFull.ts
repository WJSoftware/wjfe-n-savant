import type { BeforeNavigateEvent, NavigationCancelledEvent, FullModeHistoryApi, Events } from "../types.js";
import { LocationLite } from "./LocationLite.svelte.js";
import { InterceptedHistoryApi } from "./InterceptedHistoryApi.svelte.js";

/**
 * Location implementation of the library's full mode feature.
 * Replaces window.history with an InterceptedHistoryApi to capture all navigation events.
 */
export class LocationFull extends LocationLite {
    #historyApi: FullModeHistoryApi;
    
    constructor(historyApi?: FullModeHistoryApi) {
        const api = historyApi ?? new InterceptedHistoryApi();
        super(api);
        this.#historyApi = api;
    }

    on(event: 'beforeNavigate', callback: (event: BeforeNavigateEvent) => void): () => void;
    on(event: 'navigationCancelled', callback: (event: NavigationCancelledEvent) => void): () => void;
    on(event: Events, callback: Function): () => void {
        return this.#historyApi.on(event as any, callback as any);
    }
}
