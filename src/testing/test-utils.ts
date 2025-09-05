import { type Hash, type RouteInfo } from "$lib/types.js";
import { RouterEngine } from "$lib/core/RouterEngine.svelte.js";
import { getRouterContextKey } from "../lib/Router/Router.svelte";
import { createRawSnippet } from "svelte";
import type { RoutingOptions } from "$lib/core/options.js";
import { resolveHashValue } from "$lib/core/resolveHashValue.js";
import { vi } from "vitest";

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

function addRoute(router: RouterEngine, matching: boolean, options?: { name?: string; } & Omit<RouteInfo, 'and'>) {
    const { name = newRandomRouteKey() } = options || {};
    delete options?.name;
    router.routes[name] = {
        ...options,
        and: () => matching
    };
    return name;
}

/**
 * Adds a matching route to the router
 */
export function addMatchingRoute(router: RouterEngine, options?: { name?: string; } & Omit<RouteInfo, 'and'>) {
    return addRoute(router, true, options);
}

/**
 * Adds a non-matching route to the router
 */
export function addNonMatchingRoute(router: RouterEngine, options?: { name?: string; } & Omit<RouteInfo, 'and'>) {
    return addRoute(router, false, options);
}

type RouteSpecs = {
    count: number;
    specs: Omit<RouteInfo, 'and'>;
}

export function addRoutes(router: RouterEngine, routes: { matching?: number; nonMatching?: number; }): string[];
export function addRoutes(router: RouterEngine, routes: { matching?: RouteSpecs ; nonMatching?: RouteSpecs; }): string[];
export function addRoutes(router: RouterEngine, routes: { matching?: number | RouteSpecs; nonMatching?: number | RouteSpecs; }) {
    const { matching = 0, nonMatching = 0 } = routes;
    const routeNames: string[] = [];
    [[matching, addMatchingRoute] as const, [nonMatching, addNonMatchingRoute] as const].forEach(x => {
        const [r, fn] = x;
        if (typeof r === 'number') {
            for (let i = 0; i < r; i++) {
                routeNames.push(fn(router));
            }
        } else {
            for (let i = 0; i < r.count; i++) {
                routeNames.push(fn(router, r.specs));
            }
        }
    });
    return routeNames;
}

// ========================================
// Browser API Mocking Utilities
// ========================================

/**
 * Mock window.location object with getter/setter for href and other properties
 */
export function createLocationMock(initialUrl = "http://example.com/") {
    let _url = new URL(initialUrl);

    return {
        get href() { return _url.href; },
        set href(value: string) { _url = new URL(value, _url); },
        // Add other location properties as needed
        get pathname() { return _url.pathname; },
        get search() { return _url.search; },
        get hash() { return _url.hash; },
        get origin() { return _url.origin; },
        get protocol() { return _url.protocol; },
        get host() { return _url.host; },
        get hostname() { return _url.hostname; },
        get port() { return _url.port; },
    };
}

/**
 * Mock window.history object with state management and navigation methods
 */
export function createHistoryMock() {
    let _state: any = null;
    
    const pushStateMock = vi.fn((state: any, title: string, url?: string) => {
        _state = state;
        if (url) {
            // Update location href if URL is provided
            if (globalThis.window?.location) {
                globalThis.window.location.href = url;
            }
        }
    });
    
    const replaceStateMock = vi.fn((state: any, title: string, url?: string) => {
        _state = state;
        if (url) {
            // Update location href if URL is provided
            if (globalThis.window?.location) {
                globalThis.window.location.href = url;
            }
        }
    });
    
    return {
        get state() { return _state; },
        // According to MDN, state is read-only, but I would be OK with this setter if it eases unit testing.
        set state(value: any) { _state = value; },
        pushState: pushStateMock,
        replaceState: replaceStateMock,
        get length() { return 1; }, // Simple mock value
        go: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
    };
}

/**
 * Mock full window object with location, history, and event handling
 */
export function createWindowMock(initialUrl = "http://example.com/") {
    const locationMock = createLocationMock(initialUrl);
    const historyMock = createHistoryMock();
    const eventListeners = new Map<string, EventListener[]>();
    
    return {
        location: locationMock,
        history: historyMock,
        
        // Event handling
        addEventListener: vi.fn((type: string, listener: EventListener) => {
            if (!eventListeners.has(type)) {
                eventListeners.set(type, []);
            }
            eventListeners.get(type)!.push(listener);
        }),
        
        removeEventListener: vi.fn((type: string, listener: EventListener) => {
            const listeners = eventListeners.get(type);
            if (listeners) {
                const index = listeners.indexOf(listener);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        }),
        
        dispatchEvent: vi.fn((event: Event) => {
            const listeners = eventListeners.get(event.type);
            if (listeners) {
                listeners.forEach(listener => listener(event));
            }
            return true;
        }),
        
        // Utility methods for testing
        _getEventListeners: () => eventListeners,
        _clearEventListeners: () => eventListeners.clear(),
    };
}

/**
 * Sets up browser API mocks for testing
 * Returns cleanup function to restore original values
 */
export function setupBrowserMocks(initialUrl = "http://example.com/", libraryLocation?: { url: { href: string } }) {
    const originalWindow = globalThis.window;
    const windowMock = createWindowMock(initialUrl);
    
    // @ts-expect-error - Mocking window for testing
    globalThis.window = windowMock;
    
    return {
        window: windowMock,
        location: windowMock.location,
        history: windowMock.history,
        
        // Cleanup function
        cleanup: () => {
            globalThis.window = originalWindow;
        },
        
        // Utility functions
        setUrl: (url: string) => {
            windowMock.location.href = url;
            // Also update library location if provided
            if (libraryLocation) {
                libraryLocation.url.href = url;
            }
            // Trigger popstate to notify location service (simulates natural browser behavior)
            const event = new PopStateEvent('popstate', { state: windowMock.history.state });
            windowMock.dispatchEvent(event);
        },
        
        setState: (state: any) => {
            windowMock.history.state = state;
        },
        
        triggerPopstate: (state?: any) => {
            const event = new PopStateEvent('popstate', { state: state ?? windowMock.history.state });
            windowMock.dispatchEvent(event);
        },
        
        // For tests that need to simulate external history changes
        simulateHistoryChange: (state: any, url?: string) => {
            if (url) {
                windowMock.location.href = url;
            }
            windowMock.history.state = state;
            // Trigger popstate to notify location service
            const event = new PopStateEvent('popstate', { state });
            windowMock.dispatchEvent(event);
        },
    };
}

/**
 * Simpler mock setup using vi.stubGlobal (alternative approach)
 */
export function setupSimpleBrowserMocks(initialUrl = "http://example.com/") {
    const locationMock = createLocationMock(initialUrl);
    const historyMock = createHistoryMock();
    
    vi.stubGlobal('window', {
        location: locationMock,
        history: historyMock,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    });
    
    return {
        location: locationMock,
        history: historyMock,
        
        cleanup: () => {
            vi.unstubAllGlobals();
        },
        
        setUrl: (url: string) => {
            locationMock.href = url;
        },
        
        setState: (state: any) => {
            historyMock.state = state;
        },
    };
}
