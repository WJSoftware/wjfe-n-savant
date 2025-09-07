import { describe, test, expect, beforeEach, afterEach, afterAll } from "vitest";
import { LocationLite } from "./LocationLite.svelte.js";
import { LocationState } from "./LocationState.svelte.js";
import type { Hash, Location } from "$lib/types.js";
import { setupBrowserMocks, ROUTING_UNIVERSES, ALL_HASHES } from "../../testing/test-utils.js";

describe("LocationLite", () => {
    const initialUrl = "http://example.com/";
    let location: Location;
    let browserMocks: ReturnType<typeof setupBrowserMocks>;
    
    beforeEach(() => {
        browserMocks = setupBrowserMocks(initialUrl);
        location = new LocationLite();
    });
    
    afterEach(() => {
        location.dispose();
        browserMocks.cleanup();
    });
    describe("constructor", () => {
        test("Should create a new instance with the expected default values.", () => {
            // Assert.
            expect(location.url.href).toBe(initialUrl);
        });
        test("Should use the provided LocationState instance.", () => {
            // Arrange.
            const locationState = new LocationState();
            // Act.
            // @ts-expect-error Parameter not disclosed.
            const location = new LocationLite(locationState);

            // Assert.
            expect(location.url).toBe(locationState.url);

            // Cleanup.
            location.dispose();
        });
    });
    describe("on", () => {
        test("Should throw an error when called.", () => {
            // Act.
            const act = () => location.on('beforeNavigate', () => { });

            // Assert.
            expect(act).toThrowError();
        });
    });
    describe("url", () => {
        test("Should update whenever a popstate event is triggered.", () => {
            // Arrange.
            const newUrl = "http://example.com/new";

            // Act.
            browserMocks.setUrl(newUrl);

            // Assert.
            expect(location.url.href).toBe(newUrl);
        });
    });
    describe("getState", () => {
        test.each<{ hash: Hash; expectedState: any; }>([
            {
                hash: ALL_HASHES.path,
                expectedState: 1,
            },
            {
                hash: ALL_HASHES.single,
                expectedState: 2,
            },
            {
                hash: 'abc',
                expectedState: 3,
            },
        ])(`Should return the state associated with the "$hash" hash value.`, ({ hash, expectedState }) => {
            // Arrange.
            const testState = {
                path: 1,
                hash: {
                    single: 2,
                    abc: 3
                }
            };
            browserMocks.setState(testState);
            location = new LocationLite();

            // Act.
            const state = location.getState(hash);

            // Assert.
            expect(state).toBe(expectedState);
        });
        test("Should update whenever a popstate event is triggered.", () => {
            // Arrange.
            const pathState = 1;
            const singleHashState = 2;
            const abcHashState = 3;
            const testState = {
                path: pathState,
                hash: {
                    single: singleHashState,
                    abc: abcHashState
                }
            };

            // Act.
            browserMocks.simulateHistoryChange(testState);

            // Assert.
            expect(location.getState(ALL_HASHES.path)).toBe(pathState);
            expect(location.getState(ALL_HASHES.single)).toBe(singleHashState);
            expect(location.getState('abc')).toBe(abcHashState);
        });
    });
    describe("Event Synchronization", () => {
        test.each([
            {
                event: 'popstate',
            },
            {
                event: 'hashchange',
            }
        ])("Should carry over previous state when a $event occurs that carries no state.", ({ event }) => {
            // Arrange - Set up initial state in LocationLite
            const initialState = {
                path: { preserved: "path-data" },
                hash: { 
                    single: { preserved: "hash-data" },
                    multi1: { preserved: "multi-data" }
                }
            };
            browserMocks.simulateHistoryChange(initialState);
            
            // Verify initial state is set
            expect(location.getState(ALL_HASHES.path)).toEqual({ preserved: "path-data" });
            expect(location.getState(ALL_HASHES.single)).toEqual({ preserved: "hash-data" });
            expect(location.getState("multi1")).toEqual({ preserved: "multi-data" });

            // Act - Trigger event with no state (simulates anchor hash navigation)
            const newUrl = "http://example.com/#new-anchor";
            browserMocks.setUrl(newUrl);
            browserMocks.history.state = null; // Simulate no state from browser
            
            // Trigger the specific event type
            const eventObj = event === 'popstate' 
                ? new PopStateEvent('popstate', { state: null })
                : new HashChangeEvent('hashchange');
            browserMocks.window.dispatchEvent(eventObj);

            // Assert - Previous state should be preserved
            expect(location.getState(ALL_HASHES.path)).toEqual({ preserved: "path-data" });
            expect(location.getState(ALL_HASHES.single)).toEqual({ preserved: "hash-data" });
            expect(location.getState("multi1")).toEqual({ preserved: "multi-data" });
            
            // URL should be updated though
            expect(location.url.href).toBe(newUrl);
        });

        test("Should update state when browser event carries new state", () => {
            // Arrange - Set up initial state
            const initialState = {
                path: { initial: "data" },
                hash: { single: { initial: "hash" } }
            };
            browserMocks.simulateHistoryChange(initialState);

            // Act - Trigger popstate with new state
            const newState = {
                path: { updated: "data" },
                hash: { single: { updated: "hash" } }
            };
            const newUrl = "http://example.com/updated";
            browserMocks.simulateHistoryChange(newState, newUrl);

            // Assert - State should be updated
            expect(location.getState(ALL_HASHES.path)).toEqual({ updated: "data" });
            expect(location.getState(ALL_HASHES.single)).toEqual({ updated: "hash" });
            expect(location.url.href).toBe(newUrl);
        });

        test("Should preserve state when history.state is undefined", () => {
            // Arrange - Set up initial state
            const initialState = {
                path: { preserved: "path" },
                hash: { single: { preserved: "single" } }
            };
            browserMocks.simulateHistoryChange(initialState);

            // Act - Simulate browser event with undefined state
            browserMocks.history.state = undefined;
            const event = new PopStateEvent('popstate', { state: undefined });
            browserMocks.window.dispatchEvent(event);

            // Assert - State should be preserved due to nullish coalescing
            expect(location.getState(ALL_HASHES.path)).toEqual({ preserved: "path" });
            expect(location.getState(ALL_HASHES.single)).toEqual({ preserved: "single" });
        });

        test("Should preserve state when history.state is null", () => {
            // Arrange - Set up initial state
            const initialState = {
                path: { preserved: "path" },
                hash: { single: { preserved: "single" } }
            };
            browserMocks.simulateHistoryChange(initialState);

            // Act - Simulate browser event with null state
            browserMocks.history.state = null;
            const event = new PopStateEvent('popstate', { state: null });
            browserMocks.window.dispatchEvent(event);

            // Assert - State should be preserved due to nullish coalescing
            expect(location.getState(ALL_HASHES.path)).toEqual({ preserved: "path" });
            expect(location.getState(ALL_HASHES.single)).toEqual({ preserved: "single" });
        });
    });
});

describe("LocationLite - Browser API Integration", () => {
    const initialUrl = "http://example.com/";
    let location: Location;
    let browserMocks: ReturnType<typeof setupBrowserMocks>;
    
    beforeEach(() => {
        browserMocks = setupBrowserMocks(initialUrl);
        location = new LocationLite();
    });
    
    afterEach(() => {
        location.dispose();
        browserMocks.cleanup();
    });

    describe("Browser history integration", () => {
        test("Should properly sync with browser pushState operations", () => {
            // Arrange
            const newUrl = "http://example.com/new-path";
            const newState = { path: { test: "data" }, hash: {} };

            // Act - Simulate external pushState call
            browserMocks.history.pushState(newState, "", newUrl);
            browserMocks.triggerPopstate(newState);

            // Assert
            expect(location.url.href).toBe(newUrl);
            expect(location.getState(ALL_HASHES.path)).toEqual({ test: "data" });
        });

        test("Should properly sync with browser replaceState operations", () => {
            // Arrange
            const newUrl = "http://example.com/replaced-path";
            const newState = { path: { replaced: true }, hash: {} };

            // Act - Simulate external replaceState call
            browserMocks.history.replaceState(newState, "", newUrl);
            browserMocks.triggerPopstate(newState);

            // Assert
            expect(location.url.href).toBe(newUrl);
            expect(location.getState(ALL_HASHES.path)).toEqual({ replaced: true });
        });

        test("Should handle hash-based state updates", () => {
            // Arrange
            const newUrl = "http://example.com/#/hash-path";
            const newState = { path: undefined, hash: { single: { hash: "data" } } };

            // Act
            browserMocks.simulateHistoryChange(newState, newUrl);

            // Assert
            expect(location.url.href).toBe(newUrl);
            expect(location.getState(ALL_HASHES.single)).toEqual({ hash: "data" });
        });

        test("Should handle multi-hash state updates", () => {
            // Arrange
            const hashId = "testHash";
            const newUrl = "http://example.com/#testHash=/multi-path";
            const newState = { 
                path: undefined, 
                hash: { [hashId]: { multi: "data" } } 
            };

            // Act
            browserMocks.simulateHistoryChange(newState, newUrl);

            // Assert
            expect(location.url.href).toBe(newUrl);
            expect(location.getState(hashId)).toEqual({ multi: "data" });
        });

        test("Should preserve existing state during partial updates", () => {
            // Arrange - Set initial state
            const initialState = {
                path: { initial: "path" },
                hash: { 
                    single: { initial: "single" },
                    multi1: { initial: "multi1" }
                }
            };
            browserMocks.simulateHistoryChange(initialState);

            // Act - Update only single hash
            const updatedState = {
                path: { initial: "path" },
                hash: { 
                    single: { updated: "single" },
                    multi1: { initial: "multi1" } // Should be preserved
                }
            };
            browserMocks.simulateHistoryChange(updatedState);

            // Assert
            expect(location.getState(ALL_HASHES.path)).toEqual({ initial: "path" });
            expect(location.getState(ALL_HASHES.single)).toEqual({ updated: "single" });
            expect(location.getState("multi1")).toEqual({ initial: "multi1" });
        });
    });
});

// Test across all routing universes for comprehensive coverage
ROUTING_UNIVERSES.forEach((universe) => {
    describe(`LocationLite - ${universe.text}`, () => {
        let browserMocks: ReturnType<typeof setupBrowserMocks>;
        let location: Location;
        
        beforeEach(() => {
            browserMocks = setupBrowserMocks("http://example.com/");
            location = new LocationLite();
        });
        
        afterEach(() => {
            location.dispose();
            browserMocks.cleanup();
        });

        describe("State management across universes", () => {
            test("Should properly handle state storage and retrieval", () => {
                // Arrange
                const testState = { universe: universe.text, data: 123 };
                
                // Act - Store state for this universe
                if (universe.hash === ALL_HASHES.implicit) {
                    // For implicit hash, we can't directly test storage without navigation
                    // This is handled by the routing system, so we skip this test
                    return;
                } else {
                    // Set state directly and trigger popstate to notify LocationLite
                    const newState = universe.hash === ALL_HASHES.path 
                        ? { path: testState, hash: {} }
                        : universe.hash === ALL_HASHES.single
                        ? { path: undefined, hash: { single: testState } }
                        : { path: undefined, hash: { [universe.hash]: testState } };
                    
                    browserMocks.simulateHistoryChange(newState);
                    
                    // Assert
                    expect(location.getState(universe.hash)).toEqual(testState);
                }
            });

            test("Should handle popstate events correctly", () => {
                // Arrange
                const testState = { popstate: 'test', value: 456 };
                const newUrl = universe.hash === ALL_HASHES.path 
                    ? "http://example.com/test-path"
                    : "http://example.com/#test-hash";
                
                // Act
                browserMocks.simulateHistoryChange(
                    universe.hash === ALL_HASHES.path
                        ? { path: testState, hash: {} }
                        : universe.hash === ALL_HASHES.single
                        ? { path: undefined, hash: { single: testState } }
                        : typeof universe.hash === 'string'
                        ? { path: undefined, hash: { [universe.hash]: testState } }
                        : { path: undefined, hash: {} }, // implicit case
                    newUrl
                );
                
                // Assert
                expect(location.url.href).toBe(newUrl);
                if (universe.hash !== ALL_HASHES.implicit) {
                    expect(location.getState(universe.hash)).toEqual(testState);
                }
            });
        });
    });
});
