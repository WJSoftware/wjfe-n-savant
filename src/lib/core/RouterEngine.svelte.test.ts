import { describe, test, expect, beforeAll, afterAll, vi } from "vitest";
import { routePatternsKey, RouterEngine } from "./RouterEngine.svelte.js";
import { init, type RouteInfo } from "$lib/index.js";
import { registerRouter } from "./trace.svelte.js";
import { location } from "./Location.js";

describe("RouterEngine", () => {
    describe('constructor', () => {
        const { registerRouterMock } = vi.hoisted(() => {
            return { registerRouterMock: vi.fn() };
        });
        vi.mock("./trace.svelte.js", async (originalImport) => {
            return {
                ...await originalImport(),
                registerRouter: registerRouterMock,
            };
        });
        test("Should throw an error if the library hasn't been initialized", () => {
            // Act.
            const act = () => new RouterEngine();

            // Assert.
            expect(act).toThrowError();
        });
        test("Should register the router if traceOptions.routerHierarchy is true", () => {
            // Arrange.
            const cleanup = init({ trace: { routerHierarchy: true } });

            // Act.
            const router = new RouterEngine();

            // Assert.
            expect(registerRouter).toHaveBeenCalled();

            // Cleanup.
            cleanup();
        });
    });
});

describe("RouterEngine", () => {
    let _href: string;
    let cleanup: () => void;
    let interceptedState: any = null;
    const pushStateMock = vi.fn((state, _, url) => {
        globalThis.window.location.href = new URL(url).href;
        interceptedState = state;
    });
    const replaceStateMock = vi.fn((state, _, url) => {
        globalThis.window.location.href = new URL(url).href;
        interceptedState = state;
    });
    beforeAll(() => {
        cleanup = init();
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
    afterAll(() => {
        location.dispose();
    });
    describe('basePath', () => {
        test("Should be '/' by default", () => {
            // Act.
            const router = new RouterEngine();

            // Assert.
            expect(router.basePath).toBe('/');
        });
        test("Should be the parent's basePath plus the router's basePath", () => {
            // Arrange.
            const parent = new RouterEngine();
            parent.basePath = '/parent';
            const router = new RouterEngine(parent);
            router.basePath = '/child';

            // Act.
            const basePath = router.basePath;

            // Assert.
            expect(basePath).toBe('/parent/child');
        });
        test("Should remove the trailing slash.", () => {
            // Arrange.
            const router = new RouterEngine();
            router.basePath = '/abc/';

            // Act.
            const basePath = router.basePath;

            // Assert.
            expect(basePath).toBe('/abc');
        });
    });
    describe('url', () => {
        test("Should return the current URL.", () => {
            // Arrange.
            const router = new RouterEngine();
            location.url.href = "http://example.com/path?query#hash";

            // Act.
            const url = router.url;

            // Assert.
            expect(url).toBe(location.url);
        });
    });
    describe('state', () => {
        test("Should return the current state.", () => {
            // Arrange.
            const router = new RouterEngine();
            const state = { key: "value" };

            // Act.
            globalThis.window.history.pushState(state, '', 'http://example.com/other');

            // Assert.
            expect(router.state).toBe(location.state);
        });
    });
    describe('routes', () => {
        test("Should recalculate the route patterns whenever a new route is added.", () => {
            // Arrange.
            const router = new RouterEngine();
            const route: RouteInfo = {
                pattern: '/path',
                caseSensitive: false,
            };
            expect(Object.keys(router.routes).length).toBe(0);

            // Act.
            router.routes['route'] = route;

            // Assert.
            expect(router[routePatternsKey]().has('route')).toBe(true);
        });
        test("Should recalculate the route patterns whenever a route is removed.", () => {
            // Arrange.
            const router = new RouterEngine();
            const route: RouteInfo = {
                pattern: '/path',
                caseSensitive: false,
            };
            router.routes['route'] = route;
            expect(Object.keys(router.routes).length).toBe(1);

            // Act.
            delete router.routes['route'];

            // Assert.
            expect(router[routePatternsKey]().has('route')).toBe(false);
        });
        test("Should recalculate the route patterns whenever a route is updated.", () => {
            // Arrange.
            const router = new RouterEngine();
            const route: RouteInfo = {
                pattern: '/path',
                caseSensitive: false,
            };
            router.routes['route'] = route;
            expect(Object.keys(router.routes).length).toBe(1);

            // Act.
            router.routes['route'].pattern = '/other';

            // Assert.
            expect(router[routePatternsKey]().has('route')).toBe(true);
            expect(router[routePatternsKey]().get('route')!.regex!.test('/other')).toBe(true);
        });
        describe('Route Patterns', () => {
            test.each(
                [
                    {
                        pattern: '/path',
                        testPathname: '/path',
                        text: 'zero parameters',
                    },
                    {
                        pattern: '/:one',
                        testPathname: '/path',
                        text: '1 parameter',
                        params: {
                            one: 'path',
                        }
                    },
                    {
                        pattern: '/:one/:two',
                        testPathname: '/path/value',
                        text: '2 parameters',
                        params: {
                            one: 'path',
                            two: 'value',
                        }
                    },
                    {
                        pattern: '/some-:one/:two',
                        testPathname: '/some-path/value',
                        text: '2 parameters',
                        params: {
                            one: 'path',
                            two: 'value',
                        }
                    },
                    {
                        pattern: '/path/:one',
                        testPathname: '/path/value',
                        text: '1 parameter',
                        params: {
                            one: 'value',
                        }
                    },
                    {
                        pattern: '/path/:one/sub/:two',
                        testPathname: '/path/value/sub/other',
                        text: '2 parameters',
                        params: {
                            one: 'value',
                            two: 'other',
                        }
                    },
                    {
                        pattern: '/:one/sub/:two',
                        testPathname: '/value/sub/other',
                        text: '2 parameters',
                        params: {
                            one: 'value',
                            two: 'other',
                        }
                    },
                    {
                        pattern: '/path-to.:one/sub/:two',
                        testPathname: '/path-to.value/sub/other',
                        text: '2 parameters',
                        params: {
                            one: 'value',
                            two: 'other',
                        }
                    },
                    {
                        pattern: '/*',
                        testPathname: '/value',
                        text: '1 parameter',
                        params: {
                            rest: '/value',
                        }
                    },
                    {
                        pattern: '/*',
                        testPathname: '/value/two',
                        text: '1 parameter',
                        params: {
                            rest: '/value/two',
                        }
                    },
                    {
                        pattern: '/path/*',
                        testPathname: '/path/two',
                        text: '1 parameter',
                        params: {
                            rest: '/two',
                        }
                    },
                    {
                        pattern: '/path/:one/*',
                        testPathname: '/path/to/two',
                        text: '2 parameters',
                        params: {
                            one: 'to',
                            rest: '/two',
                        }
                    },
                    {
                        pattern: '/path-:one/*',
                        testPathname: '/path-to/two',
                        text: '2 parameters',
                        params: {
                            one: 'to',
                            rest: '/two',
                        }
                    },
                ] as { pattern: string; testPathname: string; text: string; params?: Record<string, string> }[]
            )("Should identify $text in pattern $pattern testing with $testPathname .", ({ pattern, testPathname, params }) => {
                // Arrange.
                const router = new RouterEngine();
                const route: RouteInfo = {
                    pattern,
                    caseSensitive: false,
                };
                router.routes['route'] = route;

                // Act.
                const matches = router[routePatternsKey]().get('route')!.regex?.exec(testPathname);

                // Assert.
                expect(matches).toBeDefined();
                if (params) {
                    expect(matches!.groups).toBeDefined();
                    expect(Object.keys(matches!.groups!).length).toBe(Object.keys(params).length);
                    for (let key in params) {
                        expect(matches!.groups![key]).toBe(params[key]);
                    }
                }
            });
            test.each([
                {
                    pattern: '/path',
                    testPathname: '/other',
                },
                {
                    pattern: '/:one',
                    testPathname: '/path/other',
                },
                {
                    pattern: '/:one/:two',
                    testPathname: '/path',
                },
                {
                    pattern: '/path/:one',
                    testPathname: '/path',
                },
                {
                    pattern: '/path/:one/sub/:two',
                    testPathname: '/path/value/sub',
                },
                {
                    pattern: '/:one/sub/:two',
                    testPathname: '/value/sub',
                },
                {
                    pattern: '/path/*',
                    testPathname: '/value',
                },
                {
                    pattern: '/path/*',
                    testPathname: '/other/two',
                },
            ])("Should not match pattern $pattern with pathname $testPathname .", ({ pattern, testPathname }) => {
                // Arrange.
                const router = new RouterEngine();
                const route: RouteInfo = {
                    pattern,
                    caseSensitive: false,
                };
                router.routes['route'] = route;

                // Act.
                const matches = router[routePatternsKey]().get('route')!.regex?.exec(testPathname);

                // Assert.
                expect(matches).toBeNull();
            });
            test.each([
                {
                    pattern: '/:one?',
                    testPathname: '/path',
                    text: '1 parameter',
                    willMatch: true,
                    params: {
                        one: 'path',
                    },
                },
                {
                    pattern: '/:one?',
                    testPathname: '/',
                    text: '0 parameters',
                    willMatch: true,
                },
                {
                    pattern: '/:one?',
                    testPathname: '/abc/def',
                    text: '0 parameters',
                    willMatch: false,
                },
                {
                    pattern: '/:one/:two?',
                    testPathname: '/abc/def',
                    text: '2 parameters',
                    willMatch: true,
                    params: {
                        one: 'abc',
                        two: 'def',
                    },
                },
                {
                    pattern: '/:one/or%20:two?',
                    testPathname: '/abc/or%20def',
                    text: '2 parameters',
                    willMatch: true,
                    params: {
                        one: 'abc',
                        two: 'def',
                    },
                },
                {
                    pattern: '/:one/:two?',
                    testPathname: '/abc/',
                    text: '2 parameters',
                    willMatch: true,
                    params: {
                        one: 'abc',
                        two: undefined,
                    },
                },
                {
                    pattern: '/:one/:two?',
                    testPathname: '/abc',
                    text: '2 parameters',
                    willMatch: true,
                    params: {
                        one: 'abc',
                        two: undefined,
                    },
                },
                {
                    pattern: '/:one?/:two',
                    testPathname: '/abc',
                    text: '2 parameters',
                    willMatch: true,
                    params: {
                        one: undefined,
                        two: 'abc',
                    },
                },
                {
                    pattern: '/:one?/:two',
                    testPathname: '/abc/def',
                    text: '2 parameters',
                    willMatch: true,
                    params: {
                        one: 'abc',
                        two: 'def',
                    },
                },
                {
                    pattern: '/maybe-:one?/:two',
                    testPathname: '/maybe-/def',
                    text: '2 parameters',
                    willMatch: true,
                    params: {
                        one: undefined,
                        two: 'def',
                    },
                },
            ] as {
                pattern: string;
                testPathname: string;
                text: string;
                willMatch: boolean;
                params?: Record<string, string>;
            }[])("Should match $text in pattern $pattern with pathname $testPathname .", ({ pattern, testPathname, willMatch, params }) => {
                // Arrange.
                const router = new RouterEngine();
                const route: RouteInfo = {
                    pattern,
                    caseSensitive: false,
                };
                router.routes['route'] = route;

                // Act.
                const matches = router[routePatternsKey]().get('route')!.regex?.exec(testPathname);

                // Assert.
                expect(!!matches).toBe(willMatch);
                if (willMatch && params) {
                    expect(matches!.groups).toBeDefined();
                    expect(Object.keys(matches!.groups!).length).toBe(Object.keys(params).length);
                    for (let key in params) {
                        expect(matches!.groups![key]).toBe(params[key]);
                    }
                }
            });
        });
    });
});
