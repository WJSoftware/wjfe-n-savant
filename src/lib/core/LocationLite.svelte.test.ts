import { describe, test, expect, beforeEach, beforeAll, vi, afterEach } from "vitest";
import { LocationLite } from "./LocationLite.svelte.js";
import { LocationState } from "./LocationState.svelte.js";
import type { Hash, Location, State } from "$lib/types.js";
import { joinPaths } from "./RouterEngine.svelte.js";
import { init } from "$lib/index.js";

describe("LocationLite", () => {
    const initialUrl = "http://example.com/";
    let interceptedState: State;
    const pushStateMock = vi.fn((state, _, url) => {
        url = !url.startsWith('http://') ? joinPaths(initialUrl, url) : url;
        globalThis.window.location.href = new URL(url).href;
        interceptedState = state;
    });
    const replaceStateMock = vi.fn((state, _, url) => {
        url = !url.startsWith('http://') ? joinPaths(initialUrl, url) : url;
        globalThis.window.location.href = new URL(url).href;
        interceptedState = state;
    });
    let location: Location;
    let _href: string;
    beforeAll(() => {
        // @ts-expect-error Many missing features.
        globalThis.window.location = {
            get href() {
                return _href;
            },
            set href(value) {
                _href = value;
            }
        };
        // @ts-expect-error Many missing features.
        globalThis.window.history = {
            get state() {
                return interceptedState;
            },
            pushState: pushStateMock,
            replaceState: replaceStateMock
        };
    })
    beforeEach(() => {
        globalThis.window.location.href = initialUrl;
        interceptedState = { path: undefined, hash: {} };
        pushStateMock.mockReset();
        replaceStateMock.mockReset();
        location = new LocationLite();
    });
    afterEach(() => {
        location.dispose();
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
            globalThis.window.location.href = newUrl;
            globalThis.window.dispatchEvent(new PopStateEvent('popstate'));

            // Assert.
            expect(location.url.href).toBe(newUrl);
        });
    });
    describe("getState", () => {
        test.each<{ hash: Hash; expectedState: any; }>([
            {
                hash: false,
                expectedState: 1,
            },
            {
                hash: true,
                expectedState: 2,
            },
            {
                hash: 'abc',
                expectedState: 3,
            },
        ])(`Should return the state associated with the "$hash" hash value.`, ({ hash, expectedState }) => {
            // Arrange.
            interceptedState = {
                path: 1,
                hash: {
                    single: 2,
                    abc: 3
                }
            };
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
            interceptedState = {
                path: pathState,
                hash: {
                    single: singleHashState,
                    abc: abcHashState
                }
            };

            // Act.
            globalThis.window.dispatchEvent(new PopStateEvent('popstate'));

            // Assert.
            expect(location.getState(false)).toBe(pathState);
            expect(location.getState(true)).toBe(singleHashState);
            expect(location.getState('abc')).toBe(abcHashState);
        });
    });
    describe("navigate", () => {
        test.each([
            {
                replace: false,
                expectedMethod: pushStateMock,
                text: 'pushState',
                hash: false,
            },
            {
                replace: true,
                expectedMethod: replaceStateMock,
                text: 'replaceState',
                hash: false,
            },
            {
                replace: false,
                expectedMethod: pushStateMock,
                text: 'pushState',
                hash: true,
            },
            {
                replace: true,
                expectedMethod: replaceStateMock,
                text: 'replaceState',
                hash: true,
            },
        ])("Should call $text whenever the 'replace' option is $replace .", ({ replace, expectedMethod, hash }) => {
            // Arrange.
            const newUrl = (hash ? "#" : '') + "/new";
            const newState = { some: "state" };
            const expectedArg = hash ? { hash: { single: newState } } : { path: newState, hash: {} };

            // Act.
            location.navigate(newUrl, { replace, state: newState });

            // Assert.
            expect(expectedMethod).toHaveBeenCalledWith(expectedArg, '', newUrl);
        });
        test("Should trigger an update on the location's URL and state values when doing path routing navigation.", () => {
            // Arrange.
            const newPath = '/new';
            const state = 123;

            // Act.
            location.navigate(newPath, { state });

            // Assert.
            expect(location.url.pathname).toBe(newPath);
            expect(location.getState(false)).toBe(state);
        });
        test("Should trigger an update on the location's URL and state values when doing hash routing navigation.", () => {
            // Arrange.
            const newPath = '#/new';
            const state = 456;

            // Act.
            location.navigate(newPath, { state });

            // Assert.
            expect(location.url.hash).toBe(newPath);
            expect(location.getState(true)).toBe(state);
        });
        test("Should trigger an update on the location's URL and state values when doing multi hash routing navigation.", () => {
            // Arrange.
            const hash = 'abc';
            const newPath = '/new';
            const state = 456;
            location.dispose();
            init({ hashMode: 'multi' });

            // Act.
            location.navigate(newPath, hash, { state });

            // Assert.
            expect(location.url.hash).toBe(`#${hash}=${newPath}`);
            expect(location.getState(hash)).toBe(state);
        });
    });
});
