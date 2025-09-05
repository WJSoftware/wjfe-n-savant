import { type Hash } from "$lib/types.js";
import { RouterEngine } from "$lib/core/RouterEngine.svelte.js";
import { getRouterContextKey } from "../lib/Router/Router.svelte";
import { createRawSnippet } from "svelte";
import type { RoutingOptions } from "$lib/core/options.js";
import { resolveHashValue } from "$lib/core/resolveHashValue.js";

/**
 * Standard routing universe test configurations
 */
export const ROUTING_UNIVERSES: {
    hash: Hash | undefined;
    implicitMode: RoutingOptions['implicitMode'];
    hashMode: Exclude<RoutingOptions['hashMode'], undefined>;
    text: string;
    name: string;
}[] = [
    { hash: undefined, implicitMode: 'path', hashMode: 'single', text: "IMP", name: "Implicit Path Routing" },
    { hash: undefined, implicitMode: 'hash', hashMode: 'single', text: "IMH", name: "Implicit Hash Routing" },
    { hash: false, implicitMode: 'path', hashMode: 'single', text: "PR", name: "Path Routing" },
    { hash: true, implicitMode: 'path', hashMode: 'single', text: "HR", name: "Hash Routing" },
    { hash: 'p1', implicitMode: 'path', hashMode: 'multi', text: "MHR", name: "Multi Hash Routing" },
] as const;

/**
 * Creates a router and context setup for testing
 */
export function createRouterTestSetup(hash: Hash | undefined) {
    let router: RouterEngine | undefined;
    let context: Map<any, any>;
    
    const init = () => {
        // Dispose previous router if it exists
        router?.dispose();
        
        // Create fresh router and context for each test
        router = new RouterEngine({ hash });
        context = new Map();
        context.set(getRouterContextKey(resolveHashValue(hash)), router);
    };
    
    const dispose = () => {
        router?.dispose();
        router = undefined;
        context = new Map();
    };
    
    return {
        get hash() { return hash; },
        get router() { 
            if (!router) throw new Error('Router not initialized. Call init() first.');
            return router; 
        },
        get context() { 
            if (!context) throw new Error('Context not initialized. Call init() first.');
            return context; 
        },
        init,
        dispose
    };
}

/**
 * Creates a test snippet with the given content
 */
export function createTestSnippet(contentText: string) {
    return createRawSnippet(() => {
        return {
            render: () => `<div>${contentText}</div>`
        };
    });
}

/**
 * Generates a new random route key
 */
export function newRandomRouteKey() {
    return `route-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Adds a matching route to the router
 */
export function addMatchingRoute(router: RouterEngine, routeName?: string) {
    routeName ||= newRandomRouteKey();
    router.routes[routeName] = {
        and: () => true
    };
    return routeName;
}

/**
 * Adds a non-matching route to the router
 */
export function addNonMatchingRoute(router: RouterEngine, routeName?: string) {
    routeName ||= newRandomRouteKey();
    router.routes[routeName] = {
        and: () => false
    };
    return routeName;
}

export function addRoutes(router: RouterEngine, routes: { matching?: number; nonMatching?: number; }) {
    const { matching = 0, nonMatching = 0 } = routes;
    const routeNames = [];
    for (let i = 0; i < matching; i++) {
        routeNames.push(addMatchingRoute(router));
    }
    for (let i = 0; i < nonMatching; i++) {
        routeNames.push(addNonMatchingRoute(router));
    }
    return routeNames;
}
