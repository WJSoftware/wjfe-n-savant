import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { StockHistoryApi } from "./StockHistoryApi.svelte.js";
import { setupBrowserMocks } from "../../testing/test-utils.js";

describe("StockHistoryApi", () => {
    const initialUrl = "http://example.com/";
    let historyApi: StockHistoryApi;
    let browserMocks: ReturnType<typeof setupBrowserMocks>;

    beforeEach(() => {
        browserMocks = setupBrowserMocks(initialUrl);
        historyApi = new StockHistoryApi();
    });

    afterEach(() => {
        historyApi.dispose();
        browserMocks.cleanup();
    });

    describe("constructor", () => {
        test("Should create a new instance with the expected default values.", () => {
            // Assert.
            expect(historyApi.url.href).toBe(initialUrl);
            expect(historyApi.state).toEqual({
                path: undefined,
                hash: {}
            });
        });

        test("Should accept initial URL and state parameters.", () => {
            // Arrange.
            const customUrl = "http://example.com/custom";
            const customState = {
                path: { custom: "value" },
                hash: { single: { data: "test" } }
            };

            // Act.
            const customHistoryApi = new StockHistoryApi(customUrl, customState);

            // Assert.
            expect(customHistoryApi.url.href).toBe(customUrl);
            expect(customHistoryApi.state).toEqual(customState);

            // Cleanup.
            customHistoryApi.dispose();
        });

        test("Should set up event listeners for popstate and hashchange when window is available.", () => {
            // Arrange.
            const addEventListenerSpy = vi.spyOn(globalThis.window, 'addEventListener');

            // Act.
            const testApi = new StockHistoryApi();

            // Assert.
            expect(addEventListenerSpy).toHaveBeenCalledWith('popstate', expect.any(Function), expect.any(Object));
            expect(addEventListenerSpy).toHaveBeenCalledWith('hashchange', expect.any(Function), expect.any(Object));

            // Cleanup.
            testApi.dispose();
            addEventListenerSpy.mockRestore();
        });
    });

    describe("Browser History API delegation", () => {
        test("Should delegate length property to window.history.length.", () => {
            // Arrange.
            const mockLength = 5;
            Object.defineProperty(globalThis.window.history, 'length', {
                value: mockLength,
                configurable: true
            });

            // Assert.
            expect(historyApi.length).toBe(mockLength);
        });

        test("Should delegate scrollRestoration getter to window.history.scrollRestoration.", () => {
            // Arrange.
            globalThis.window.history.scrollRestoration = 'manual';

            // Assert.
            expect(historyApi.scrollRestoration).toBe('manual');
        });

        test("Should delegate scrollRestoration setter to window.history.scrollRestoration.", () => {
            // Act.
            historyApi.scrollRestoration = 'manual';

            // Assert.
            expect(globalThis.window.history.scrollRestoration).toBe('manual');
        });

        test("Should delegate back() to window.history.back().", () => {
            // Arrange.
            const backSpy = vi.spyOn(globalThis.window.history, 'back');

            // Act.
            historyApi.back();

            // Assert.
            expect(backSpy).toHaveBeenCalled();
        });

        test("Should delegate forward() to window.history.forward().", () => {
            // Arrange.
            const forwardSpy = vi.spyOn(globalThis.window.history, 'forward');

            // Act.
            historyApi.forward();

            // Assert.
            expect(forwardSpy).toHaveBeenCalled();
        });

        test("Should delegate go() to window.history.go().", () => {
            // Arrange.
            const goSpy = vi.spyOn(globalThis.window.history, 'go');
            const delta = 2;

            // Act.
            historyApi.go(delta);

            // Assert.
            expect(goSpy).toHaveBeenCalledWith(delta);
        });
    });

    describe("pushState", () => {
        test("Should call window.history.pushState with the provided state.", () => {
            // Arrange.
            const pushStateSpy = vi.spyOn(globalThis.window.history, 'pushState');
            const testState = { path: { custom: "data" }, hash: {} };
            const testUrl = "/new/path";

            // Act.
            historyApi.pushState(testState, "", testUrl);

            // Assert.
            expect(pushStateSpy).toHaveBeenCalledWith(
                testState,
                "",
                testUrl
            );
        });

        test("Should update internal URL and state after pushState.", () => {
            // Arrange.
            const testState = { path: { custom: "data" }, hash: {} };
            const testUrl = "http://example.com/new/path";

            // Act.
            historyApi.pushState(testState, "", testUrl);

            // Assert.
            expect(historyApi.url.href).toBe(testUrl);
            expect(historyApi.state).toEqual(testState);
        });
    });

    describe("replaceState", () => {
        test("Should call window.history.replaceState with the provided state.", () => {
            // Arrange.
            const replaceStateSpy = vi.spyOn(globalThis.window.history, 'replaceState');
            const testState = { path: { custom: "data" }, hash: {} };
            const testUrl = "/replaced/path";

            // Act.
            historyApi.replaceState(testState, "", testUrl);

            // Assert.
            expect(replaceStateSpy).toHaveBeenCalledWith(
                testState,
                "",
                testUrl
            );
        });

        test("Should update internal URL and state after replaceState.", () => {
            // Arrange.
            const testState = { path: { custom: "data" }, hash: {} };
            const testUrl = "http://example.com/replaced/path";

            // Act.
            historyApi.replaceState(testState, "", testUrl);

            // Assert.
            expect(historyApi.url.href).toBe(testUrl);
            expect(historyApi.state).toEqual(testState);
        });
    });

    describe("Event handling", () => {
        test("Should update URL and state when popstate event occurs.", () => {
            // Arrange.
            const newUrl = "http://example.com/popstate-test";
            const newState = {
                path: { popped: "data" },
                hash: { single: { test: "value" } }
            };

            // Act.
            browserMocks.simulateHistoryChange(newState, newUrl);

            // Assert.
            expect(historyApi.url.href).toBe(newUrl);
            expect(historyApi.state).toEqual(newState);
        });

        test("Should preserve state when popstate event has null state.", () => {
            // Arrange.
            const initialState = {
                path: { preserved: "data" },
                hash: { single: { preserved: "hash-data" } }
            };
            historyApi.replaceState(initialState.path, "", historyApi.url.href);
            
            // Set hash state separately
            const newState = { ...initialState };
            historyApi['state'] = newState;

            const newUrl = "http://example.com/null-state-test";

            // Act.
            browserMocks.simulateHistoryChange(null, newUrl);

            // Assert.
            expect(historyApi.url.href).toBe(newUrl);
            expect(historyApi.state.path).toEqual(initialState.path);
            expect(historyApi.state.hash).toEqual(initialState.hash);
        });

        test("Should handle hashchange event by updating URL and clearing hash state.", () => {
            // Arrange.
            const initialState = {
                path: { preserved: "path-data" },
                hash: { single: { cleared: "will-be-cleared" } }
            };
            historyApi['state'] = initialState;

            const newUrl = "http://example.com/test#newhash";
            const replaceStateSpy = vi.spyOn(globalThis.window.history, 'replaceState');

            // Act.
            browserMocks.setUrl(newUrl);
            globalThis.window.dispatchEvent(new HashChangeEvent('hashchange'));

            // Assert.
            expect(historyApi.url.href).toBe(newUrl);
            expect(historyApi.state).toEqual({
                path: initialState.path,
                hash: {}
            });
            expect(replaceStateSpy).toHaveBeenCalledWith(
                { path: initialState.path, hash: {} },
                '',
                newUrl
            );
        });
    });

    describe("dispose", () => {
        test("Should remove event listeners when disposed.", () => {
            // Arrange.
            const removeEventListenerSpy = vi.spyOn(globalThis.window, 'removeEventListener');

            // Act.
            historyApi.dispose();

            // Assert.
            expect(removeEventListenerSpy).toHaveBeenCalledWith('popstate', expect.any(Function), expect.any(Object));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('hashchange', expect.any(Function), expect.any(Object));
        });

        test("Should not throw when disposed multiple times.", () => {
            // Act & Assert.
            expect(() => {
                historyApi.dispose();
                historyApi.dispose();
            }).not.toThrow();
        });
    });

    describe("State normalization", () => {
        test("Should handle invalid state by normalizing to default state.", () => {
            // Arrange.
            const pushStateSpy = vi.spyOn(globalThis.window.history, 'pushState');
            const invalidState = "not a valid state";

            // Act.
            historyApi.pushState(invalidState, "", "/test");

            // Assert.
            expect(pushStateSpy).toHaveBeenCalledWith(
                { path: undefined, hash: {} },
                "",
                "/test"
            );
        });

        test("Should handle URL objects in pushState.", () => {
            // Arrange.
            const pushStateSpy = vi.spyOn(globalThis.window.history, 'pushState');
            const testState = { path: { test: "data" }, hash: {} };
            const urlObject = new URL("http://example.com/url-object");

            // Act.
            historyApi.pushState(testState, "", urlObject);

            // Assert.
            expect(pushStateSpy).toHaveBeenCalledWith(
                testState,
                "",
                urlObject
            );
            expect(historyApi.url.href).toBe(urlObject.href);
        });
    });

    describe("Error handling", () => {
        test("Should handle missing window gracefully.", () => {
            // Arrange.
            const originalWindow = globalThis.window;
            // @ts-ignore
            delete globalThis.window;

            // Act & Assert.
            expect(() => {
                const testApi = new StockHistoryApi();
                expect(testApi.length).toBe(0);
                expect(testApi.scrollRestoration).toBe('auto');
                testApi.scrollRestoration = 'manual';
                testApi.back();
                testApi.forward();
                testApi.go(1);
                testApi.pushState({}, "", "/test");
                testApi.replaceState({}, "", "/test");
                testApi.dispose();
            }).not.toThrow();

            // Restore.
            globalThis.window = originalWindow;
        });
    });
    describe("Event Synchronization", () => {
        test("Should preserve history state when popstate is triggered carrying a non-conformant state value.", () => {
            // Arrange.
            const initialState = {
                path: { preserved: "path-data" },
                hash: {
                    single: { preserved: "hash-data" },
                    multi1: { preserved: "multi-data" }
                }
            };
            browserMocks.simulateHistoryChange(initialState);
            
            // Act.
            browserMocks.triggerPopstate({});

            // Assert - LocationLite should reflect the state preserved by its HistoryApi
            expect(historyApi.state).toEqual(initialState);
        });

        test("Should reflect HistoryApi hash state clearing on hashchange.", () => {
            // Arrange.
            const initialState = {
                path: { preserved: "path-data" },
                hash: {
                    single: { preserved: "hash-data" },
                    multi1: { preserved: "multi-data" }
                }
            };
            browserMocks.simulateHistoryChange(initialState);

            // Act.
            browserMocks.triggerHashChange();

            // Assert - LocationLite should reflect hash state clearing by HistoryApi
            expect(historyApi.state).toEqual({
                ...initialState,
                hash: {}
            });
        });

        test("Should reflect HistoryApi state updates from browser events.", () => {
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

            // Assert - LocationLite should reflect HistoryApi state changes
            expect(historyApi.url.href).toBe(newUrl);
            expect(historyApi.state).toEqual(newState);
        });

        test.each([
            undefined,
            null
        ])("Should reflect HistoryApi state preservation when history.state is %s.", (stateValue) => {
            // Arrange - Set up state through LocationLite
            const initialState = {
                path: { preserved: "path" },
                hash: { single: { preserved: "single" } }
            };
            browserMocks.simulateHistoryChange(initialState);

            // Act - Simulate browser event with undefined state
            browserMocks.history.state = undefined;
            const event = new PopStateEvent('popstate', { state: stateValue });
            browserMocks.window.dispatchEvent(event);

            // Assert - LocationLite should reflect preserved state from HistoryApi
            expect(historyApi.state).toEqual(initialState);
        });
    });
});
