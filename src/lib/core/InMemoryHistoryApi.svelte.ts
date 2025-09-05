import type { HistoryApi, State } from "$lib/types.js";
import { LocationState } from "./LocationState.svelte.js";

/**
 * In-memory implementation of the History API.
 */
export class InMemoryHistoryApi extends LocationState implements HistoryApi {
    scrollRestoration: ScrollRestoration = 'manual';
    #history = $state<{ state: State; title: string; url: string }[]>([]);
    #currentIndex = $state(-1);
    #cleanup: (() => void) | undefined;

    constructor() {
        super();
        this.#cleanup = $effect.root(() => {
            $effect(() => {
                const entry = this.#getCurrentEntry();
                if (entry) {
                    this.url.href = new URL(entry.url, 'http://mem.local').href;
                    this.state = entry.state;
                }
            })
        })
    }

    dispose(): void {
        this.#cleanup?.();
        this.#cleanup = undefined;
    }

    #getCurrentEntry() {
        return this.#currentIndex < 0 ? null : this.#history[this.#currentIndex];
    }

    get length() {
        return this.#history.length;
    }

    pushState(state: State, title: string, url: string): void {
        this.#history.splice(this.#currentIndex + 1);
        this.#history.push({ state, title, url });
        ++this.#currentIndex;
    }

    replaceState(state: State, title: string, url: string): void {
        if (this.#currentIndex >= 0) {
            this.#history[this.#currentIndex] = { state, title, url };
        }
        else {
            this.#history.push({ state, title, url });
        }
    }

    go(delta: number): void {
        const newIndex = this.#currentIndex + delta;
        if (newIndex >= 0 && newIndex < this.#history.length) {
            this.#currentIndex = newIndex;
        }
    }

    back(): void {
        this.go(-1);
    }

    forward(): void {
        this.go(1);
    }
}
