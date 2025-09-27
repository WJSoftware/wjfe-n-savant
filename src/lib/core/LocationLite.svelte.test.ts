import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { LocationLite } from "./LocationLite.svelte.js";
import type { ExtendedRoutingOptions, Hash, HistoryApi, PreserveQuery } from "../types.js";
import { setupBrowserMocks, ALL_HASHES } from "../../testing/test-utils.js";
import { SvelteURL } from "svelte/reactivity";
import { setLocation } from "./Location.js";
import { resetRoutingOptions, setRoutingOptions } from "./options.js";

describe("LocationLite", () => {
    const initialUrl = "http://example.com/";
    let location: LocationLite;
    let browserMocks: ReturnType<typeof setupBrowserMocks>;

    beforeEach(() => {
        browserMocks = setupBrowserMocks(initialUrl);
        location = new LocationLite();
        setLocation(location);
    });

    afterEach(() => {
        location.dispose();
        setLocation(null);
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
    describe('goTo', () => {
        test.each<{
            qs: string;
            preserveQuery: PreserveQuery;
            text: string;
            expectedQs: string;
        }>([
            {
                qs: 'some=value',
                preserveQuery: false,
                text: 'not preserve',
                expectedQs: '',
            },
            {
                qs: 'some=value',
                preserveQuery: true,
                text: 'preserve',
                expectedQs: '?some=value',
            },
            {
                qs: 'some=value&plus=another',
                preserveQuery: 'plus',
                text: 'preserve',
                expectedQs: '?plus=another',
            },
            {
                qs: 'some=value&plus=another&extra=thing',
                preserveQuery: ['plus', 'extra'],
                text: 'preserve',
                expectedQs: '?plus=another&extra=thing',
            },
        ])
            ("Should $text the query string when instructed by the value $preserveQuery in the preserveQuery option.", ({ qs, preserveQuery, expectedQs }) => {
                // Arrange.
                location.url.search = window.location.search = qs;
                const newPath = '/new/path';

                // Act.
                location.goTo(newPath, { preserveQuery });

                // Assert.
                expect(window.location.pathname).to.equal(newPath);
                expect(window.location.search).to.equal(`${expectedQs}`);
            });
    });
    describe('navigate', () => {
        afterEach(() => {
            resetRoutingOptions();
        });
        
        test.each<{
            qs: string;
            preserveQuery: PreserveQuery;
            text: string;
            expectedQs: string;
        }>([
            {
                qs: 'some=value',
                preserveQuery: false,
                text: 'not preserve',
                expectedQs: '',
            },
            {
                qs: 'some=value',
                preserveQuery: true,
                text: 'preserve',
                expectedQs: '?some=value',
            },
            {
                qs: 'some=value&plus=another',
                preserveQuery: 'plus',
                text: 'preserve',
                expectedQs: '?plus=another',
            },
            {
                qs: 'some=value&plus=another&extra=thing',
                preserveQuery: ['plus', 'extra'],
                text: 'preserve',
                expectedQs: '?plus=another&extra=thing',
            },
        ])("Should $text the query string when instructed by the value $preserveQuery in the preserveQuery option.", ({ qs, preserveQuery, expectedQs }) => {
            // Arrange.
            location.url.search = window.location.search = qs;
            const newPath = '/new/path';

            // Act.
            location.navigate(newPath, { preserveQuery });

            // Assert.
            expect(window.location.pathname).to.equal(newPath);
            expect(window.location.search).to.equal(`${expectedQs}`);
        });
        test.each<{
            hash: Hash;
            desc: string;
            options: ExtendedRoutingOptions;
        }>([
            {
                hash: ALL_HASHES.path,
                desc: 'path',
                options: { disallowPathRouting: true}
            },
            {
                hash: ALL_HASHES.single,
                desc: 'hash',
                options: { disallowHashRouting: true}
            },
            {
                hash: ALL_HASHES.multi,
                desc: 'multi hash',
                options: { disallowMultiHashRouting: true}
            },
        ])("Should throw an error when the hash option is $hash and $desc routing is disallowed.", ({ hash, options }) => {
            // Arrange.
            const newPath = '/new/path';
            setRoutingOptions(options);

            // Act.
            const act = () => location.navigate(newPath, { hash });

            // Assert.
            expect(act).toThrow();
        });
    });
});
