import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { LocationFull } from "./LocationFull.js";
import type { State, Location } from "$lib/types.js";
import { joinPaths } from "./RouterEngine.svelte.js";

describe("LocationFull", () => {
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
    });
    beforeEach(() => {
        globalThis.window.location.href = initialUrl;
        interceptedState = { path: undefined, hash: {} };
        pushStateMock.mockReset();
        replaceStateMock.mockReset();
        location = new LocationFull();
    });
    afterEach(() => {
        location.dispose();
    });
    describe('constructor', () => {
        test("Should create a new instance with the expected default values.", () => {
            // Assert.
            expect(location.url.href).toBe(initialUrl);
        });
    });
    describe('on', () => {
        test("Should register the provided callback for the 'beforeNavigate' event.", () => {
            // Arrange.
            const callback = vi.fn();
            const unSub = location.on('beforeNavigate', callback);

            // Act.
            globalThis.window.history.pushState(null, '', 'http://example.com/other');

            // Assert.
            expect(callback).toHaveBeenCalledOnce();

            // Cleanup.
            unSub();
        });
        test.each([
            {
                method: 'push',
                stateFn: 'pushState',
            },
            {
                method: 'replace',
                stateFn: 'replaceState',
            }
        ])("Should provide the URL, state and method $method via the event object of 'beforeNavigate'.", ({ method, stateFn }) => {
            // Arrange.
            const callback = vi.fn();
            const state = { path: { test: 'value' }, hash: {} };
            const unSub = location.on('beforeNavigate', callback);

            // Act.
            // @ts-expect-error stateFn cannot enumerate history.
            globalThis.window.history[stateFn](state, '', 'http://example.com/other');

            // Assert.
            expect(callback).toHaveBeenCalledWith({
                url: 'http://example.com/other',
                method,
                state,
                wasCancelled: false,
                cancelReason: undefined,
                cancel: expect.any(Function)
            });

            // Cleanup.
            unSub();
        });
        test("Should set wasCancelled to true and cancelReason to the provided reason when the event is cancelled to subsequent callbacks.", () => {
            // Arrange.
            const callback = vi.fn();
            const unSub1 = location.on('beforeNavigate', (event) => event.cancel('test'));
            const unSub2 = location.on('beforeNavigate', callback);

            // Act.
            globalThis.window.history.pushState(null, '', 'http://example.com/other');

            // Assert.
            expect(callback).toHaveBeenCalledWith({
                url: 'http://example.com/other',
                method: 'push',
                state: null,
                wasCancelled: true,
                cancelReason: 'test',
                cancel: expect.any(Function)
            });

            // Cleanup.
            unSub1();
            unSub2();
        });
        test("Should ignore cancellation reasons from callbacks if the event has already been cancelled.", () => {
            // Arrange.
            const callback = vi.fn();
            const unSub1 = location.on('beforeNavigate', (event) => event.cancel('test'));
            const unSub2 = location.on('beforeNavigate', (event) => event.cancel('ignored'));
            const unSub3 = location.on('beforeNavigate', callback);

            // Act.
            globalThis.window.history.pushState(null, '', 'http://example.com/other');

            // Assert.
            expect(callback).toHaveBeenCalledWith({
                url: 'http://example.com/other',
                method: 'push',
                state: null,
                wasCancelled: true,
                cancelReason: 'test',
                cancel: expect.any(Function)
            });

            // Cleanup.
            unSub1();
            unSub2();
            unSub3();
        });
        test.each([
            'pushState' as const,
            'replaceState' as const,
        ])("Should ultimately push the state data via the %s method set by beforeNavigate handlers in event.state.", (stateFn) => {
            // Arrange.
            const state = { path: { test: 'value' }, hash: {} };
            const callback = vi.fn((event) => {
                event.state = state;
            });
            const unSub = location.on('beforeNavigate', callback);

            // Act.
            globalThis.window.history[stateFn](null, '', 'http://example.com/other');

            // Assert.
            expect(callback).toHaveBeenCalledOnce();
            expect(globalThis.window.history.state).deep.equal(state);

            // Cleanup.
            unSub();
        });
        test("Should register the provided callback for the 'navigationCancelled' event.", () => {
            // Arrange.
            const callback = vi.fn();
            const unSub1 = location.on('beforeNavigate', (event) => event.cancel());
            const unSub2 = location.on('navigationCancelled', callback);

            // Act.
            globalThis.window.history.pushState(null, '', 'http://example.com/other');

            // Assert.
            expect(callback).toHaveBeenCalledOnce();

            // Cleanup.
            unSub1();
            unSub2();
        });
        test("Should transfer the cause of cancellation and the state to the 'navigationCancelled' event.", () => {
            // Arrange.
            const callback = vi.fn();
            const reason = 'test';
            const state = { test: 'value' };
            const unSub1 = location.on('beforeNavigate', (event) => event.cancel(reason));
            const unSub2 = location.on('navigationCancelled', callback);

            // Act.
            globalThis.window.history.pushState(state, '', 'http://example.com/other');

            // Assert.
            expect(callback).toHaveBeenCalledWith({ url: 'http://example.com/other', cause: 'test', method: 'push', state });

            // Cleanup.
            unSub1();
            unSub2();
        });
    });
    describe('url', () => {
        test.each([
            'pushState',
            'replaceState',
        ] satisfies (keyof History)[])("Should update whenever an external call to %s is made.", (fn) => {
            // Arrange.
            const newUrl = "http://example.com/new";

            // Act.
            globalThis.window.history[fn](null, '', newUrl);

            // Assert.
            expect(location.url.href).toBe(newUrl);
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
            expect(location.getState(false)).toEqual(state.path);
            expect(location.getState(true)).toEqual(state.hash.single);
            expect(location.getState('p1')).toEqual(state.hash.p1);
        });
    });
    describe('Navigation Interception', () => {
        test.each([
            'pushState' as const,
            'replaceState' as const,
        ])("Should preserve the previous valid state whenever %s is called with non-conformant state.", (stateFn) => {
            // Arrange.
            const validState = { path: { test: 'value' }, hash: {} };
            globalThis.window.history[stateFn](validState, '', 'http://example.com/');
            const state = { test: 'value' };

            // Act.
            globalThis.window.history[stateFn](state, '', 'http://example.com/other');

            // Assert.
            expect(globalThis.window.history.state).deep.equals(validState);
        });
    });
});