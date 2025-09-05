import type { BeforeNavigateEvent, Hash, Location, GoToOptions, NavigateOptions, NavigationCancelledEvent, State } from "../types.js";
import { getCompleteStateKey } from "./Location.js";
import { on } from "svelte/events";
import { LocationState } from "./LocationState.svelte.js";
import { routingOptions } from "./options.js";
import { resolveHashValue } from "./resolveHashValue.js";
import { calculateHref } from "./calculateHref.js";
import { calculateState } from "./calculateState.js";
import { preserveQueryInUrl } from "./preserveQuery.js";

/**
 * A lite version of the location object.  It does not support event listeners or state-setting call interceptions, 
 * which are normally only needed when mixing router libraries.
 */
export class LocationLite implements Location {
    #innerState: LocationState;
    #cleanup: (() => void) | undefined;
    hashPaths = $derived.by(() => {
        if (routingOptions.hashMode === 'single') {
            return { single: this.#innerState.url.hash.substring(1) };
        }
        const result = {} as Record<string, string>;
        const paths = this.#innerState.url.hash.substring(1).split(';');
        for (let rawPath of paths) {
            const [id, path] = rawPath.split('=');
            if (!id || !path) {
                continue;
            }
            result[id] = path;
        }
        return result;
    });

    constructor() {
        const [innerState] = arguments;
        if (innerState instanceof LocationState) {
            this.#innerState = innerState;
        }
        else {
            this.#innerState = new LocationState();
        }
        this.#cleanup = $effect.root(() => {
            const cleanups = [] as (() => void)[];
            ['popstate', 'hashchange'].forEach((event) => {
                cleanups.push(on(globalThis.window, event, () => {
                    this.#innerState.url.href = globalThis.window?.location?.href;
                    this.#innerState.state = globalThis.window?.history?.state;
                }));
            });
            return () => {
                for (let cleanup of cleanups) {
                    cleanup();
                }
            };
        });
    }

    on(event: "beforeNavigate", callback: (event: BeforeNavigateEvent) => void): () => void;
    on(event: "navigationCancelled", callback: (event: NavigationCancelledEvent) => void): () => void;
    on(_event: unknown, _callback: unknown): (() => void) | (() => void) {
        throw new Error("This feature is only available when initializing the routing library with the full option.");
    }

    get url() {
        return this.#innerState.url;
    }

    getState(hash: Hash) {
        if (typeof hash === 'string') {
            return this.#innerState.state?.hash[hash];
        }
        if (hash) {
            return this.#innerState.state?.hash.single;
        }
        return this.#innerState.state?.path;
    }

    #goTo(url: string, replace: boolean, state: State | undefined) {
        if (url === '') {
            // Shallow routing.
            url = this.url.href;
        }
        (
            replace ?
                globalThis.window?.history.replaceState :
                globalThis.window?.history.pushState
        ).bind(globalThis.window?.history)(state, '', url);
        this.#innerState.url.href = globalThis.window?.location.href;
        this.#innerState.state = state ?? { path: undefined, hash: {} };
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
        return $state.snapshot(this.#innerState.state);
    }

    dispose() {
        this.#cleanup?.();
        this.#cleanup = undefined;
    }
}
