import { SvelteURL } from "svelte/reactivity";

export class LocationState {
    url = new SvelteURL(globalThis.window?.location?.href);
    state = globalThis.window?.history?.state;
}
