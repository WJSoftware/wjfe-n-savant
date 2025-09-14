import { on } from "svelte/events";
import type { HistoryApi, State } from "$lib/types.js";
import { LocationState } from "./LocationState.svelte.js";

/**
 * Standard implementation of HistoryApi that uses the browser's native History API
 * and window.location. This is the default implementation used in normal browser environments.
 */
export class StockHistoryApi extends LocationState implements HistoryApi {
    #cleanupFunctions: (() => void)[] = [];

    constructor(initialUrl?: string, initialState?: State) {
        super(initialUrl, initialState);
        if (typeof globalThis.window !== 'undefined') {
            this.#cleanupFunctions.push(
                on(globalThis.window, 'popstate', this.#handlePopstateEvent),
                on(globalThis.window, 'hashchange', this.#handleHashChangeEvent)
            );
        }
    }

    #handlePopstateEvent = (event: PopStateEvent): void => {
        this.url.href = globalThis.window.location.href;
        this.state = this.normalizeState(event.state, this.state);
    }

    #handleHashChangeEvent = (event: HashChangeEvent): void => {
        this.url.href = globalThis.window.location.href;
        this.state = {
            path: this.state.path,
            hash: {}
        };
        // Synchronize the environment's history state with a replace call.
        globalThis.window.history.replaceState($state.snapshot(this.state), '', this.url.href);
    }

    // History API implementation
    get length(): number {
        return globalThis.window?.history?.length ?? 0;
    }

    get scrollRestoration(): ScrollRestoration {
        return globalThis.window?.history?.scrollRestoration ?? 'auto';
    }

    set scrollRestoration(value: ScrollRestoration) {
        if (globalThis.window?.history) {
            globalThis.window.history.scrollRestoration = value;
        }
    }

    back(): void {
        globalThis.window?.history?.back();
    }

    forward(): void {
        globalThis.window?.history?.forward();
    }

    go(delta?: number): void {
        globalThis.window?.history?.go(delta);
    }

    #updateHistory(
        historyMethod: 'replaceState' | 'pushState',
        data: any,
        unused: string,
        url?: string | URL | null
    ): void {
        const normalizedState = this.normalizeState(data);
        globalThis.window?.history[historyMethod](normalizedState, unused, url);
        this.url.href = globalThis.window?.location?.href ?? new URL(url ?? '', this.url).href;
        this.state = normalizedState;
    }

    pushState(data: any, unused: string, url?: string | URL | null): void {
        this.#updateHistory('pushState', data, unused, url);
    }

    replaceState(data: any, unused: string, url?: string | URL | null): void {
        this.#updateHistory('replaceState', data, unused, url);
    }

    dispose(): void {
        this.#cleanupFunctions.forEach(cleanup => cleanup());
        this.#cleanupFunctions = [];
    }
}