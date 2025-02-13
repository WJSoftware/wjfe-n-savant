import { describe, test, expect, beforeEach, beforeAll, vi, afterEach } from "vitest";
import { LocationLite } from "./LocationLite.svelte.js";
import { LocationState } from "./LocationState.svelte.js";
import type { Location } from "$lib/types.js";

describe("LocationLite", () => {
    const initialUrl = "http://example.com/";
    let interceptedState: any;
    const pushStateMock = vi.fn((state, _, url) => {
        globalThis.window.location.href = new URL(url).href;
        interceptedState = state;
    });
    const replaceStateMock = vi.fn((state, _, url) => {
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
            state: null,
            pushState: pushStateMock,
            replaceState: replaceStateMock
        };
    })
    beforeEach(() => {
        globalThis.window.location.href = initialUrl;
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
            expect(location.state).toBe(null);
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
    describe("state", () => {
        test("Should update whenever a popstate event is triggered.", () => {
            // Arrange.
            const newState = { some: "state" };

            // Act.
            // @ts-expect-error Property is read-only in the browser.
            globalThis.window.history.state = newState;
            globalThis.window.dispatchEvent(new PopStateEvent('popstate'));

            // Assert.
            expect(location.state).toBe(newState);
        });
    });
    describe("navigate", () => {
        test.each([
            {
                replace: false,
                expectedMethod: pushStateMock,
                text: 'pushState',
            },
            {
                replace: true,
                expectedMethod: replaceStateMock,
                text: 'replaceState',
            }
        ])("Should call History.$text whenever the 'replace' option is $replace .", ({ replace, expectedMethod }) => {
            // Arrange.
            const newUrl = "http://example.com/new";
            const newState = { some: "state" };

            // Act.
            location.navigate(newUrl, { replace, state: newState });

            // Assert.
            expect(expectedMethod).toHaveBeenCalledWith(newState, '', newUrl);
        });
        test("Should update the URL and state properties.", () => {
            // Arrange.
            const newUrl = "http://example.com/new";
            const newState = { some: "state" };

            // Act.
            location.navigate(newUrl, { state: newState });

            // Assert.
            expect(location.url.href).toBe(newUrl);
            expect(location.state).toBe(newState);
        });
    });
});
