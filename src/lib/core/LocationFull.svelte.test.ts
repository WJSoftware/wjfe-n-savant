import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { LocationFull } from "./LocationFull.js";
import type { Events, Location } from "$lib/types.js";
import { flushSync } from "svelte";

describe("LocationFull", () => {
    const initialUrl = "http://example.com/";
    let interceptedState: any = null;
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
            get state() {
                return interceptedState;
            },
            pushState: pushStateMock,
            replaceState: replaceStateMock
        };
    });
    beforeEach(() => {
        globalThis.window.location.href = initialUrl;
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
            expect(location.state).toBe(null);
        });
    });
    describe('on', () => {
        test("Should register the provided callback for the 'beforeNavigate' event.", () => {
            // Arrange.
            const callback = vi.fn();
            location.on('beforeNavigate', callback);

            // Act.
            globalThis.window.history.pushState(null, '', 'http://example.com/other');
            flushSync();

            // Assert.
            expect(callback).toHaveBeenCalledOnce();
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
            const state = { test: 'value' };
            location.on('beforeNavigate', callback);

            // Act.
            // @ts-expect-error stateFn cannot enumerate history.
            globalThis.window.history[stateFn](state, '', 'http://example.com/other');
            flushSync();

            // Assert.
            expect(callback).toHaveBeenCalledWith({
                url: 'http://example.com/other',
                method,
                state,
                wasCancelled: false,
                cancelReason: undefined,
                cancel: expect.any(Function)
            });
        });
        test("Should set wasCancelled to true and cancelReason to the provided reason when the event is cancelled to subsequent callbacks.", () => {
            // Arrange.
            const callback = vi.fn();
            location.on('beforeNavigate', (event) => event.cancel('test'));
            location.on('beforeNavigate', callback);

            // Act.
            globalThis.window.history.pushState(null, '', 'http://example.com/other');
            flushSync();

            // Assert.
            expect(callback).toHaveBeenCalledWith({
                url: 'http://example.com/other',
                method: 'push',
                state: null,
                wasCancelled: true,
                cancelReason: 'test',
                cancel: expect.any(Function)
            });
        });
        test("Should ignore cancellation reasons from callbacks if the event has already been cancelled.", () => {
            // Arrange.
            const callback = vi.fn();
            location.on('beforeNavigate', (event) => event.cancel('test'));
            location.on('beforeNavigate', (event) => event.cancel('ignored'));
            location.on('beforeNavigate', callback);

            // Act.
            globalThis.window.history.pushState(null, '', 'http://example.com/other');
            flushSync();

            // Assert.
            expect(callback).toHaveBeenCalledWith({
                url: 'http://example.com/other',
                method: 'push',
                state: null,
                wasCancelled: true,
                cancelReason: 'test',
                cancel: expect.any(Function)
            });
        });
        test("Should register the provided callback for the 'navigationCancelled' event.", () => {
            // Arrange.
            const callback = vi.fn();
            location.on('beforeNavigate', (event) => event.cancel());
            location.on('navigationCancelled', callback);

            // Act.
            globalThis.window.history.pushState(null, '', 'http://example.com/other');
            flushSync();

            // Assert.
            expect(callback).toHaveBeenCalledOnce();
        });
        test("Should transfer the cause of cancellation and the state to the 'navigationCancelled' event.", () => {
            // Arrange.
            const callback = vi.fn();
            const reason = 'test';
            const state = { test: 'value' };
            location.on('beforeNavigate', (event) => event.cancel(reason));
            location.on('navigationCancelled', callback);

            // Act.
            globalThis.window.history.pushState(state, '', 'http://example.com/other');
            flushSync();

            // Assert.
            expect(callback).toHaveBeenCalledWith({ url: 'http://example.com/other', cause: 'test', method: 'push', state });
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
            flushSync();

            // Assert.
            expect(location.url.href).toBe(newUrl);
        });
    });
    describe('state', () => {
        test.each([
            'pushState',
            'replaceState',
        ] satisfies (keyof History)[])("Should update whenever an external call to %s is made.", (fn) => {
            // Arrange.
            const state = { test: 'value' };
            
            // Act.
            globalThis.window.history[fn](state, '', 'http://example.com/new');
            flushSync();

            // Assert.
            expect(location.state).toBe(state);
        });
    });
});