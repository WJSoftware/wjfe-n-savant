import type { State } from "$lib/types.js";
import { SvelteURL } from "svelte/reactivity";

export class LocationState {
    url = new SvelteURL(globalThis.window?.location?.href);
    state = $state((globalThis.window?.history?.state ?? { hash: {} }) as State);
}
