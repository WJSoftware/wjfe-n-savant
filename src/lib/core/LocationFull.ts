import type { BeforeNavigateEvent, Events, NavigationCancelledEvent, NavigationEvent } from "$lib/types.js";
import { isConformantState } from "./isConformantState.js";
import { LocationLite } from "./LocationLite.svelte.js";
import { LocationState } from "./LocationState.svelte.js";
import { logger } from "./Logger.js";

/**
 * Location implementation of the library's full mode feature.
 */
export class LocationFull extends LocationLite {
    #eventSubs: Record<Events, Record<number, Function>> = {
        beforeNavigate: {},
        navigationCancelled: {},
    };
    #nextSubId = 0;
    #originalPushState = globalThis.window?.history.pushState.bind(globalThis.window?.history);
    #originalReplaceState = globalThis.window?.history.replaceState.bind(globalThis.window?.history);
    #innerState;
    constructor() {
        const innerState = new LocationState();
        // @ts-expect-error Base class constructor purposely hides the fact that takes one argument.
        super(innerState);
        this.#innerState = innerState;
        globalThis.window.history.pushState = this.#navigate.bind(this, 'push');
        globalThis.window.history.replaceState = this.#navigate.bind(this, 'replace');
    }

    dispose() {
        globalThis.window.history.pushState = this.#originalPushState;
        globalThis.window.history.replaceState = this.#originalReplaceState;
        super.dispose();
    }

    #navigate(method: NavigationEvent['method'], state: any, _: string, url: string) {
        const event: BeforeNavigateEvent = {
            url,
            state,
            method,
            wasCancelled: false,
            cancelReason: undefined,
            cancel: (cause) => {
                if (event.wasCancelled) {
                    return;
                }
                event.wasCancelled = true;
                event.cancelReason = cause;
            }
        };
        for (let sub of Object.values(this.#eventSubs.beforeNavigate)) {
            sub(event);
        }
        if (event.wasCancelled) {
            for (let sub of Object.values(this.#eventSubs.navigationCancelled)) {
                sub({
                    url,
                    state: event.state,
                    method,
                    cause: event.cancelReason,
                });
            }
        } else {
            if (!isConformantState(event.state)) {
                logger.warn("Warning: Non-conformant state object passed to history." + method + "State.  Previous state will prevail.");
                event.state = this.#innerState.state;
            }
            const navFn = method === 'push' ? this.#originalPushState : this.#originalReplaceState;
            navFn(event.state, '', url);
            this.url.href = globalThis.window?.location.href;
            this.#innerState.state = state;
        }
    }

    on(event: 'beforeNavigate', callback: (event: BeforeNavigateEvent) => void): () => void;
    on(event: 'navigationCancelled', callback: (event: NavigationCancelledEvent) => void): () => void;
    on(event: Events, callback: Function): () => void {
        const id = ++this.#nextSubId;
        this.#eventSubs[event][id] = callback;
        return () => delete this.#eventSubs.beforeNavigate[id];
    }
}
