import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { LocationLite } from "./LocationLite.svelte.js";
import type { Hash, HistoryApi, Location } from "$lib/types.js";
import { setupBrowserMocks, ROUTING_UNIVERSES, ALL_HASHES } from "../../testing/test-utils.js";
import { SvelteURL } from "svelte/reactivity";

describe("LocationLite", () => {
    const initialUrl = "http://example.com/";
    let location: LocationLite;
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
        test("Should use the provided HistoryApi instance.", () => {
            // Arrange.
            const historyApi: HistoryApi = {
                url: new SvelteURL(initialUrl),
                state: {
                    path: { test: 'value' },
                    hash: {}
                },
                pushState: vi.fn(),
                replaceState: vi.fn(),
                dispose: vi.fn(),
                length: 0,
                scrollRestoration: 'auto' as const,
                back: vi.fn(),
                forward: vi.fn(),
                go: vi.fn(),
            }
            const location = new LocationLite(historyApi);

            // Act.
            location.goTo('');
            location.goTo('', { replace: true });
            location.go(1);
            location.back();
            location.forward();
            const href = location.url.toString();
            location.dispose();

            // Assert.
            expect(historyApi.pushState).toHaveBeenCalled();
            expect(historyApi.replaceState).toHaveBeenCalled();
            expect(historyApi.go).toHaveBeenCalledWith(1);
            expect(historyApi.back).toHaveBeenCalled();
            expect(historyApi.forward).toHaveBeenCalled();
            expect(href).toBe(initialUrl);
            expect(historyApi.dispose).toHaveBeenCalled();
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
});
