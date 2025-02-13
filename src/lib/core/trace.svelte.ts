import type { RouterEngine } from "./RouterEngine.svelte.js";

/**
 * Library's tracing options.
 */
export type TraceOptions = {
    /**
     * Whether to trace the router hierarchy.
     * 
     * This consumes extra RAM and a bit more CPU cycles.  Disable it on production builds.
     * @default false
     */
    routerHierarchy?: boolean;
};

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
 * Tracing options that can be set during library initialization.
 */
export const traceOptions: TraceOptions = {
    routerHierarchy: false,
};

export function setTraceOptions(options?: typeof traceOptions) {
    Object.assign(traceOptions, options);
}
