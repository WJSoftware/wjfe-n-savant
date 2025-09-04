import type { HistoryApi, State } from "$lib/types.js";
import { on } from "svelte/events";
import { LocationState } from "./LocationState.svelte.js";

export class StockHistoryApi extends LocationState implements HistoryApi {
    #cleanup: (() => void) | undefined;

    constructor() {
        super();
        const cleanups = [] as (() => void)[];
        ['popstate', 'hashchange'].forEach((event) => {
            cleanups.push(on(globalThis.window, event, () => {
                console.log(event);
                this.url.href = globalThis.window?.location?.href;
                this.state = globalThis.window?.history?.state;
            }));
        });
        this.#cleanup = () => {
            cleanups.forEach((cleanup) => cleanup());
        };
    }

    #updateState(state: State) {
        this.state = state;
        this.url.href = globalThis.window.location.href;
    }

    dispose(): void {
        this.#cleanup?.();
        this.#cleanup = undefined;
    }

    back(): void {
        this.go(-1);
    }

    forward(): void {
        this.go(1);
    }

    go(delta?: number): void {
        globalThis.window?.history.go(delta);
    }

    pushState(state: State, unused: string, url?: string | URL | null): void {
        globalThis.window?.history.pushState(state, unused, url);
        this.#updateState(state);
    }

    replaceState(state: State, unused: string, url?: string | URL | null): void {
        globalThis.window?.history.replaceState(state, unused, url);
        this.#updateState(state);
    }

    get length() {
        return globalThis.window?.history.length ?? 0;
    }

    get scrollRestoration() {
        return globalThis.window?.history.scrollRestoration ?? "auto";
    }

    set scrollRestoration(value: ScrollRestoration) {
        globalThis.window.history.scrollRestoration = value;
    }
}
