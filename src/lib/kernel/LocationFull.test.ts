import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { LocationFull } from "./LocationFull.js";
import type { State, Location, FullModeHistoryApi } from "../types.js";
import { setupBrowserMocks, ALL_HASHES } from "$test/test-utils.js";
import { SvelteURL } from "svelte/reactivity";

describe("LocationFull", () => {
    const initialUrl = "http://example.com/";
    let location: Location;
    let browserMocks: ReturnType<typeof setupBrowserMocks>;

    beforeEach(() => {
        browserMocks = setupBrowserMocks(initialUrl);
        location = new LocationFull();
    });

    afterEach(() => {
        location.dispose();
        browserMocks.cleanup();
    });

    describe('constructor', () => {
        test("Should create a new instance with the expected default values.", () => {
            // Assert.
            expect(location.url.href).toBe(initialUrl);
        });

        test("Should use provided FullModeHistoryApi instance.", () => {
            // Arrange.
            const mockHistoryApi: FullModeHistoryApi = {
                url: new SvelteURL(initialUrl),
                state: { path: { test: 'value' }, hash: {} },
                pushState: vi.fn(),
                replaceState: vi.fn(),
                dispose: vi.fn(),
                length: 0,
                scrollRestoration: 'auto' as const,
                back: vi.fn(),
                forward: vi.fn(),
                go: vi.fn(),
                on: vi.fn().mockReturnValue(() => { }),
            };
            const locationWithMock = new LocationFull(mockHistoryApi);

            // Act.
            locationWithMock.goTo('');
            locationWithMock.goTo('', { replace: true });
            locationWithMock.go(1);
            locationWithMock.back();
            locationWithMock.forward();
            const href = locationWithMock.url.toString();
            const state = locationWithMock.getState(ALL_HASHES.path);
            locationWithMock.dispose();

            // Assert.
            expect(mockHistoryApi.pushState).toHaveBeenCalled();
            expect(mockHistoryApi.replaceState).toHaveBeenCalled();
            expect(mockHistoryApi.go).toHaveBeenCalledWith(1);
            expect(mockHistoryApi.back).toHaveBeenCalled();
            expect(mockHistoryApi.forward).toHaveBeenCalled();
            expect(href).toEqual(initialUrl);
            expect(state).toEqual({ test: 'value' });
            expect(mockHistoryApi.dispose).toHaveBeenCalled();
        });
    });

    describe('on', () => {
        test("Should delegate event registration to FullModeHistoryApi.", () => {
            // Arrange.
            const mockHistoryApi: FullModeHistoryApi = {
                url: new SvelteURL(initialUrl),
                state: { path: undefined, hash: {} },
                pushState: vi.fn(),
                replaceState: vi.fn(),
                dispose: vi.fn(),
                length: 0,
                scrollRestoration: 'auto' as const,
                back: vi.fn(),
                forward: vi.fn(),
                go: vi.fn(),
                on: vi.fn().mockReturnValue(() => { }),
            };
            const locationWithMock = new LocationFull(mockHistoryApi);
            const callback = vi.fn();

            // Act.
            locationWithMock.on('beforeNavigate', callback);
            locationWithMock.on('navigationCancelled', callback);

            // Assert.
            expect(mockHistoryApi.on).toHaveBeenCalledWith('beforeNavigate', callback);
            expect(mockHistoryApi.on).toHaveBeenCalledWith('navigationCancelled', callback);

            // Cleanup.
            locationWithMock.dispose();
        });
    });

    describe('getState', () => {
        test.each([
            'pushState',
            'replaceState',
        ] satisfies (keyof History)[])("Should update whenever an external call to %s is made.", (fn) => {
            // Arrange.
            const state: State = { path: { test: 'value' }, hash: { single: '/abc', p1: '/def' } };

            // Act.
            globalThis.window.history[fn](state, '', 'http://example.com/new');

            // Assert.
            expect(location.getState(ALL_HASHES.path)).toEqual(state.path);
            expect(location.getState(ALL_HASHES.single)).toEqual(state.hash.single);
            expect(location.getState('p1')).toEqual(state.hash.p1);
        });
    });
});