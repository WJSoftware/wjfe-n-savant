import type { TraceOptions } from "../types.js";
import type { RouterEngine } from "./RouterEngine.svelte.js";

/**
 * Weak references to all router engines that are created.
 */
const allRouters = new WeakMap<RouterEngine, WeakRef<RouterEngine>[]>();

let version = $state(0);

/**
 * Registers the router engine in the `allRouters` map for tracing purposes.
 * @param router Router engine to register.
 */
export function registerRouter(router: RouterEngine) {
    if (router.parent) {
        ++version;
        let parentRefs = allRouters.get(router.parent);
        if (!parentRefs) {
            allRouters.set(router.parent, [new WeakRef(router)]);
        } else {
            parentRefs.push(new WeakRef(router));
        }
    }
}

export function unregisterRouter(router: RouterEngine) {
    if (router.parent) {
        let parentRefs = allRouters.get(router.parent);
        if (parentRefs) {
            let index = parentRefs.findIndex(ref => ref.deref() === router);
            if (index >= 0) {
                parentRefs.splice(index, 1);
                ++version;
            }
        }
        if (parentRefs?.length === 0) {
            allRouters.delete(router.parent);
            ++version;
        }
    }
}

/**
 * Obtains the list of all child router engines of the specified parent.
 * @param parent Router engine in question.
 * @returns An array with all child router engines of the specified parent.
 */
export function getAllChildRouters(parent: RouterEngine) {
    version;
    let refs = allRouters.get(parent);
    if (!refs) {
        return [];
    }
    return refs.reduce((acc, ref) => {
        const router = ref.deref();
        if (router) {
            acc.push(new WeakRef(router));
        }
        return acc;
    }, [] as WeakRef<RouterEngine>[]);
}

/**
 * Default tracing options used for rollback.
 */
export const defaultTraceOptions: Required<TraceOptions> = {
    routerHierarchy: false,
};

/**
 * Tracing options that can be set during library initialization.
 */
export const traceOptions: Required<TraceOptions> = structuredClone(defaultTraceOptions);

export function setTraceOptions(options?: TraceOptions) {
    Object.assign(traceOptions, options);
}

/**
 * Resets tracing options to their default values.
 */
export function resetTraceOptions(): void {
    Object.assign(traceOptions, structuredClone(defaultTraceOptions));
}
