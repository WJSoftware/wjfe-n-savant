import type { BeforeNavigateEvent, Hash, Location, GoToOptions, NavigateOptions, NavigationCancelledEvent, State, HistoryApi } from "../types.js";
import { getCompleteStateKey } from "./Location.js";
import { routingOptions } from "./options.js";
import { resolveHashValue } from "./resolveHashValue.js";
import { calculateHref } from "./calculateHref.js";
import { calculateState } from "./calculateState.js";
import { preserveQueryInUrl } from "./preserveQuery.js";
import { StockHistoryApi } from "./StockHistoryApi.svelte.js";
import { isConformantState } from "./isConformantState.js";

export function assertValidState(state: unknown): asserts state is State {
    if (!isConformantState(state)) {
        throw new Error('Invalid history state.');
    }
}


/**
 * A lite version of the location object.  It does not support event listeners or state-setting call interceptions, 
 * which are normally only needed when mixing router libraries.
 */
export class LocationLite implements Location {
    #historyApi: HistoryApi;
    hashPaths = $derived.by(() => {
        if (routingOptions.hashMode === 'single') {
            return { single: this.#historyApi.url.hash.substring(1) };
        }
        const result = {} as Record<string, string>;
        const paths = this.#historyApi.url.hash.substring(1).split(';');
        for (let rawPath of paths) {
            const [id, path] = rawPath.split('=');
            if (!id || !path) {
                continue;
            }
            result[id] = path;
        }
        return result;
    });

    constructor(historyApi?: HistoryApi) {
        this.#historyApi = historyApi ?? new StockHistoryApi();
    }

    on(event: "beforeNavigate", callback: (event: BeforeNavigateEvent) => void): () => void;
    on(event: "navigationCancelled", callback: (event: NavigationCancelledEvent) => void): () => void;
    on(_event: unknown, _callback: unknown): (() => void) | (() => void) {
        throw new Error("This feature is only available when initializing the routing library with the full option.");
    }

    get url() {
        return this.#historyApi.url;
    }

    getState(hash: Hash) {
        if (typeof hash === 'string') {
            return this.#historyApi.state?.hash[hash];
        }
        if (hash) {
            return this.#historyApi.state?.hash.single;
        }
        return this.#historyApi.state?.path;
    }

    #goTo(url: string, replace: boolean, state: unknown) {
        state ??= { path: undefined, hash: {} };
        assertValidState(state);
        if (url === '') {
            // Shallow routing.
            url = this.url.href;
        }
        (
            replace ?
                this.#historyApi.replaceState :
                this.#historyApi.pushState
        ).bind(this.#historyApi)(state, '', url);
        window.location.href = this.#historyApi.url.href;
        this.#historyApi.state = state;
    }

    goTo(url: string, options?: GoToOptions): void {
        if (options?.preserveQuery) {
            url = preserveQueryInUrl(url, options.preserveQuery);
        }
        this.#goTo(url, options?.replace ?? false, options?.state);
    }

    navigate(url: string, options?: NavigateOptions): void {
        const resolvedHash = resolveHashValue(options?.hash);
        if (url !== '') {
            url = calculateHref({
                ...options,
                hash: resolvedHash,
            }, url);
        }
        const newState = calculateState(resolvedHash, options?.state);
        this.#goTo(url, options?.replace ?? false, newState);
    }

    [getCompleteStateKey](): State {
        return $state.snapshot(this.#historyApi.state);
    }

    dispose() {
        this.#historyApi.dispose();
    }
}
