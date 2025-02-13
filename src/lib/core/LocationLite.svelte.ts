import type { BeforeNavigateEvent, Location, NavigateOptions, NavigationCancelledEvent } from "../types.js";
import { on } from "svelte/events";
import { LocationState } from "./LocationState.svelte.js";
import { routingOptions } from "./options.js";

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
            return on(globalThis.window, 'popstate', () => {
                console.log('popstate');
                this.#innerState.url.href = globalThis.window?.location?.href;
                this.#innerState.state = globalThis.window?.history?.state;
            });
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

    get state() {
        return this.#innerState.state;
    }

    navigate(url: string | URL, options?: NavigateOptions): void;
    navigate(url: string | URL, hashId: string, options?: NavigateOptions): void;
    navigate(url: string | URL, hashIdOrOptions?: string | NavigateOptions, options?: NavigateOptions) {
        if (typeof hashIdOrOptions === 'string') {
            let idExists = false;
            let finalUrl = '';
            for (let [id, path] of Object.entries(this.hashPaths)) {
                if (id === hashIdOrOptions) {
                    idExists = true;
                    finalUrl += `;${id}=${url}`;
                    continue;
                }
                finalUrl += `;${id}=${path}`;
            }
            if (!idExists) {
                finalUrl += `;${hashIdOrOptions}=${url}`;
            }
            url = '#' + finalUrl.substring(1);
        }
        else {
            options = hashIdOrOptions
        }
        (options?.replace ?
            globalThis.window?.history.replaceState :
            globalThis.window?.history.pushState).bind(globalThis.window?.history)(options?.state, '', url);
        this.#innerState.url.href = globalThis.window?.location.href;
        this.#innerState.state = options?.state;
    }

    dispose() {
        this.#cleanup?.();
        this.#cleanup = undefined;
    }
}
