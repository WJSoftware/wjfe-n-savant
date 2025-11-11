import type { Hash, RouteInfo, RoutingOptions } from "$lib/types.js";
import { RouterEngine } from "$lib/kernel/RouterEngine.svelte.js";
/**
 * Defines the necessary information to call the library's `init()` function for testing, plus additional metadata.
 */
export type RoutingUniverse = {
    hash: Hash | undefined;
    implicitMode: RoutingOptions['implicitMode'];
    hashMode: Exclude<RoutingOptions['hashMode'], undefined>;
    /**
     * Short universe identifier.  Used in test titles and descriptions.
     */
    text: string;
    /**
     * Descriptive universe name.  More of a document-by-code property.  Not commonly used as it makes text very long.
     */
    name: string;
};
/**
 * Standard routing universe test configurations
 */
export declare const ROUTING_UNIVERSES: RoutingUniverse[];
/**
 * All possible hash values for testing hash compatibility
 */
export declare const ALL_HASHES: {
    readonly path: false;
    readonly single: true;
    readonly multi: "p1";
    readonly implicit: undefined;
};
/**
 * Creates a router and context setup for testing
 */
export declare function createRouterTestSetup(hash: Hash | undefined): {
    readonly hash: Hash | undefined;
    readonly router: RouterEngine;
    readonly context: Map<any, any>;
    init: () => void;
    dispose: () => void;
};
/**
 * Creates a test snippet with the given content
 */
export declare function createTestSnippet(contentText: string): import("svelte").Snippet<[]>;
/**
 * Generates a new random route key
 */
export declare function newRandomRouteKey(): string;
/**
 * Adds a matching route to the router
 */
export declare function addMatchingRoute(router: RouterEngine, options?: RouteSpecs['specs']): string;
/**
 * Adds a non-matching route to the router
 */
export declare function addNonMatchingRoute(router: RouterEngine, options?: RouteSpecs['specs']): string;
type RouteSpecs = {
    count: number;
    specs: Omit<RouteInfo, 'and'> & {
        name?: string;
    };
};
export declare function addRoutes(router: RouterEngine, routes: {
    matching?: number;
    nonMatching?: number;
}, ...add: (RouteInfo & {
    name?: string;
})[]): string[];
export declare function addRoutes(router: RouterEngine, routes: {
    matching?: RouteSpecs;
    nonMatching?: RouteSpecs;
}, ...add: (RouteInfo & {
    name?: string;
})[]): string[];
/**
 * Mock window.location object with getter/setter for href and other properties
 */
export declare function createLocationMock(initialUrl?: string): {
    href: string;
    readonly pathname: string;
    search: string;
    readonly hash: string;
    readonly origin: string;
    readonly protocol: string;
    readonly host: string;
    readonly hostname: string;
    readonly port: string;
};
/**
 * Mock window.history object with state management and navigation methods
 */
export declare function createHistoryMock(): {
    state: any;
    pushState: import("vitest").Mock<(state: any, title: string, url?: string) => void>;
    replaceState: import("vitest").Mock<(state: any, title: string, url?: string) => void>;
    readonly length: number;
    go: import("vitest").Mock<(...args: any[]) => any>;
    back: import("vitest").Mock<(...args: any[]) => any>;
    forward: import("vitest").Mock<(...args: any[]) => any>;
};
/**
 * Mock full window object with location, history, and event handling
 */
export declare function createWindowMock(initialUrl?: string): {
    location: {
        href: string;
        readonly pathname: string;
        search: string;
        readonly hash: string;
        readonly origin: string;
        readonly protocol: string;
        readonly host: string;
        readonly hostname: string;
        readonly port: string;
    };
    history: {
        state: any;
        pushState: import("vitest").Mock<(state: any, title: string, url?: string) => void>;
        replaceState: import("vitest").Mock<(state: any, title: string, url?: string) => void>;
        readonly length: number;
        go: import("vitest").Mock<(...args: any[]) => any>;
        back: import("vitest").Mock<(...args: any[]) => any>;
        forward: import("vitest").Mock<(...args: any[]) => any>;
    };
    addEventListener: import("vitest").Mock<(type: string, listener: EventListener) => void>;
    removeEventListener: import("vitest").Mock<(type: string, listener: EventListener) => void>;
    dispatchEvent: import("vitest").Mock<(event: Event) => boolean>;
    _getEventListeners: () => Map<string, EventListener[]>;
    _clearEventListeners: () => void;
};
/**
 * Sets up browser API mocks for testing
 * Returns cleanup function to restore original values
 */
export declare function setupBrowserMocks(initialUrl?: string, libraryLocation?: {
    url: {
        href: string;
    };
}): {
    window: {
        location: {
            href: string;
            readonly pathname: string;
            search: string;
            readonly hash: string;
            readonly origin: string;
            readonly protocol: string;
            readonly host: string;
            readonly hostname: string;
            readonly port: string;
        };
        history: {
            state: any;
            pushState: import("vitest").Mock<(state: any, title: string, url?: string) => void>;
            replaceState: import("vitest").Mock<(state: any, title: string, url?: string) => void>;
            readonly length: number;
            go: import("vitest").Mock<(...args: any[]) => any>;
            back: import("vitest").Mock<(...args: any[]) => any>;
            forward: import("vitest").Mock<(...args: any[]) => any>;
        };
        addEventListener: import("vitest").Mock<(type: string, listener: EventListener) => void>;
        removeEventListener: import("vitest").Mock<(type: string, listener: EventListener) => void>;
        dispatchEvent: import("vitest").Mock<(event: Event) => boolean>;
        _getEventListeners: () => Map<string, EventListener[]>;
        _clearEventListeners: () => void;
    };
    location: {
        href: string;
        readonly pathname: string;
        search: string;
        readonly hash: string;
        readonly origin: string;
        readonly protocol: string;
        readonly host: string;
        readonly hostname: string;
        readonly port: string;
    };
    history: {
        state: any;
        pushState: import("vitest").Mock<(state: any, title: string, url?: string) => void>;
        replaceState: import("vitest").Mock<(state: any, title: string, url?: string) => void>;
        readonly length: number;
        go: import("vitest").Mock<(...args: any[]) => any>;
        back: import("vitest").Mock<(...args: any[]) => any>;
        forward: import("vitest").Mock<(...args: any[]) => any>;
    };
    cleanup: () => void;
    setUrl: (url: string) => void;
    setState: (state: any) => void;
    triggerPopstate: (state?: any) => void;
    triggerHashChange: () => void;
    simulateHistoryChange: (state: any, url?: string) => void;
};
/**
 * Simpler mock setup using vi.stubGlobal (alternative approach)
 */
export declare function setupSimpleBrowserMocks(initialUrl?: string): {
    location: {
        href: string;
        readonly pathname: string;
        search: string;
        readonly hash: string;
        readonly origin: string;
        readonly protocol: string;
        readonly host: string;
        readonly hostname: string;
        readonly port: string;
    };
    history: {
        state: any;
        pushState: import("vitest").Mock<(state: any, title: string, url?: string) => void>;
        replaceState: import("vitest").Mock<(state: any, title: string, url?: string) => void>;
        readonly length: number;
        go: import("vitest").Mock<(...args: any[]) => any>;
        back: import("vitest").Mock<(...args: any[]) => any>;
        forward: import("vitest").Mock<(...args: any[]) => any>;
    };
    cleanup: () => void;
    setUrl: (url: string) => void;
    setState: (state: any) => void;
};
export {};
