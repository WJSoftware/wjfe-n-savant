import { init } from "$lib/init.js";
import { location } from "$lib/kernel/Location.js";
import { describe, test, expect, beforeAll, afterAll, beforeEach, vi, afterEach } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import Link from "./Link.svelte";
import { createRouterTestSetup, createTestSnippet, ROUTING_UNIVERSES, ALL_HASHES, createWindowMock, setupBrowserMocks, type RoutingUniverse, addMatchingRoute } from "../../testing/test-utils.js";
import { flushSync } from "svelte";
import { resetRoutingOptions, setRoutingOptions } from "$lib/kernel/options.js";
import type { ExtendedRoutingOptions } from "$lib/types.js";
import { linkCtxKey, type ILinkContext } from "$lib/LinkContext/LinkContext.svelte";
import { calculateHref } from "$lib/kernel/calculateHref.js";

function basicLinkTests(setup: ReturnType<typeof createRouterTestSetup>) {
    const linkText = "Test Link";
    const content = createTestSnippet(linkText);

    beforeEach(() => {
        // Fresh router instance for each test
        setup.init();
    });

    afterAll(() => {
        // Clean disposal after all tests
        setup.dispose();
    });

    test("Should render an anchor tag with correct href.", async () => {
        // Arrange.
        const { hash, context } = setup;
        const href = "/test/path";

        // Act.
        const { container } = render(Link, {
            props: { hash, href, children: content },
            context
        });
        const anchor = container.querySelector('a');

        // Assert.
        expect(anchor).toBeDefined();
        expect(anchor?.getAttribute('href')).toBeTruthy();
    });

    test("Should render link text content.", async () => {
        // Arrange.
        const { hash, context } = setup;
        const href = "/test/path";

        // Act.
        const { findByText } = render(Link, {
            props: { hash, href, children: content },
            context
        });

        // Assert.
        await expect(findByText(linkText)).resolves.toBeDefined();
    });

    test("Should prevent default navigation on click.", async () => {
        // Arrange.
        const { hash, context } = setup;
        const href = "/test/path";
        const { container } = render(Link, {
            props: { hash, href, children: content },
            context
        });
        const anchor = container.querySelector('a');

        // Act.
        const clickEvent = new MouseEvent('click', { bubbles: true });
        const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');
        await fireEvent(anchor!, clickEvent);

        // Assert.
        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    test("Should handle navigation through location.goTo on click.", async () => {
        // Arrange.
        const { hash, context } = setup;
        const href = "/test/path";
        const goToSpy = vi.spyOn(location, 'goTo');
        const { container } = render(Link, {
            props: { hash, href, children: content },
            context
        });
        const anchor = container.querySelector('a');

        // Act.
        await fireEvent.click(anchor!);

        // Assert.
        expect(goToSpy).toHaveBeenCalled();
    });
}

function hrefCalculationTests(setup: ReturnType<typeof createRouterTestSetup>) {
    const linkText = "Test Link";
    const content = createTestSnippet(linkText);

    beforeEach(() => {
        setup.init();
    });

    afterAll(() => {
        setup.dispose();
    });

    test("Should calculate href correctly for simple path.", async () => {
        // Arrange.
        const { hash, context } = setup;
        const href = "/test/path";

        // Act.
        const { container } = render(Link, {
            props: { hash, href, children: content },
            context
        });
        const anchor = container.querySelector('a');

        // Assert.
        expect(anchor?.getAttribute('href')).toContain('test/path');
    });

    test("Should preserve query parameters when preserveQuery is true.", async () => {
        // Arrange.
        const { hash, context } = setup;
        const href = "/test/path?new=value";

        // Act.
        const { container } = render(Link, {
            props: { hash, href, preserveQuery: true, children: content },
            context
        });
        const anchor = container.querySelector('a');

        // Assert.
        expect(anchor?.getAttribute('href')).toContain('new=value');
    });

    test("Should prepend base path when prependBasePath is true.", async () => {
        // Arrange.
        const { hash, router, context } = setup;
        const href = "/test/path";

        // Set base path on router
        if (router) {
            Object.defineProperty(router, 'basePath', {
                value: '/base',
                configurable: true
            });
        }

        // Act.
        const { container } = render(Link, {
            props: { hash, href, prependBasePath: true, children: content },
            context
        });
        const anchor = container.querySelector('a');

        // Assert.
        expect(anchor?.getAttribute('href')).toContain('/base');
    });
}

function activeStateTests(setup: ReturnType<typeof createRouterTestSetup>) {
    const linkText = "Test Link";
    const content = createTestSnippet(linkText);

    beforeEach(() => {
        setup.init();
    });

    afterAll(() => {
        setup.dispose();
    });

    test("Should apply active class when route is active.", async () => {
        // Arrange.
        const { hash, router, context } = setup;
        const href = "/test/path";
        const activeKey = "test-route";

        // Mock active route status
        if (router) {
            Object.defineProperty(router, 'routeStatus', {
                value: { [activeKey]: { match: true } },
                configurable: true
            });
        }

        // Act.
        const { container } = render(Link, {
            props: {
                hash,
                href,
                activeFor: activeKey,
                activeState: { class: "active-link" },
                children: content
            },
            context
        });
        const anchor = container.querySelector('a');

        // Assert.
        expect(anchor?.className).toContain('active-link');
    });

    test("Should apply active style when route is active.", async () => {
        // Arrange.
        const { hash, router, context } = setup;
        const href = "/test/path";
        const activeKey = "test-route";

        // Mock active route status
        if (router) {
            Object.defineProperty(router, 'routeStatus', {
                value: { [activeKey]: { match: true } },
                configurable: true
            });
        }

        // Act.
        const { container } = render(Link, {
            props: {
                hash,
                href,
                activeFor: activeKey,
                activeState: { style: "color: red;" },
                children: content
            },
            context
        });
        const anchor = container.querySelector('a');

        // Assert.
        expect(anchor?.getAttribute('style')).toContain('color: red');
    });

    test("Should set any aria- attributes from activeState when route is active.", () => {
        // Arrange.
        const { hash, router, context } = setup;
        const href = "/test/path";
        const activeKey = "test-route";

        // Mock active route status
        if (router) {
            Object.defineProperty(router, 'routeStatus', {
                value: { [activeKey]: { match: false } },
                configurable: true
            });
        }

        // Act.
        const { container } = render(Link, {
            props: {
                hash,
                href,
                activeFor: activeKey,
                activeState: {
                    aria: {
                        selected: 'true',
                        current: 'page'
                    }
                },
                children: content
            },
            context
        });
        const anchor = container.querySelector('a');

        // Assert.
        expect(anchor?.getAttribute('aria-selected')).toBeNull();
        expect(anchor?.getAttribute('aria-current')).toBeNull();
    });

    test("Should not set any aria- attributes when route is not active.", async () => {
        // Arrange.
        const { hash, router, context } = setup;
        const href = "/test/path";
        const activeKey = "test-route";

        // Mock active route status
        if (router) {
            Object.defineProperty(router, 'routeStatus', {
                value: { [activeKey]: { match: true } },
                configurable: true
            });
        }

        // Act.
        const { container } = render(Link, {
            props: {
                hash,
                href,
                activeFor: activeKey,
                activeState: {
                    aria: {
                        selected: 'true',
                        current: 'page'
                    }
                },
                children: content
            },
            context
        });
        const anchor = container.querySelector('a');

        // Assert.
        expect(anchor?.getAttribute('aria-selected')).toBe('true');
        expect(anchor?.getAttribute('aria-current')).toBe('page');
    });

    test("Should not apply active styles when route is not active.", async () => {
        // Arrange.
        const { hash, router, context } = setup;
        const href = "/test/path";
        const activeKey = "test-route";

        // Mock inactive route status
        if (router) {
            Object.defineProperty(router, 'routeStatus', {
                value: { [activeKey]: { match: false } },
                configurable: true
            });
        }

        // Act.
        const { container } = render(Link, {
            props: {
                hash,
                href,
                activeFor: activeKey,
                activeState: { class: "active-link" },
                children: content
            },
            context
        });
        const anchor = container.querySelector('a');

        // Assert.
        expect(anchor?.className).not.toContain('active-link');
        expect(anchor?.getAttribute('aria-current')).toBeNull();
    });
}

function stateHandlingTests(setup: ReturnType<typeof createRouterTestSetup>) {
    const linkText = "Test Link";
    const content = createTestSnippet(linkText);

    beforeEach(() => {
        setup.init();
    });

    afterAll(() => {
        setup.dispose();
    });

    test("Should pass static state object to navigation.", async () => {
        // Arrange.
        const { hash, context } = setup;
        const href = "/test/path";
        const stateObj = { data: "test-state" };
        const goToSpy = vi.spyOn(location, 'goTo');

        const { container } = render(Link, {
            props: { hash, href, state: stateObj, children: content },
            context
        });
        const anchor = container.querySelector('a');

        // Act.
        await fireEvent.click(anchor!);

        // Assert.
        expect(goToSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                state: expect.objectContaining({
                    // State structure varies by routing universe
                    [hash === false ? 'path' : 'hash']: hash === false
                        ? expect.objectContaining(stateObj)
                        : expect.any(Object)
                })
            })
        );
    });

    test("Should call state function and pass result to navigation.", async () => {
        // Arrange.
        const { hash, context } = setup;
        const href = "/test/path";
        const stateObj = { data: "function-state" };
        const stateFn = vi.fn(() => stateObj);
        const goToSpy = vi.spyOn(location, 'goTo');

        const { container } = render(Link, {
            props: { hash, href, state: stateFn, children: content },
            context
        });
        const anchor = container.querySelector('a');

        // Act.
        await fireEvent.click(anchor!);

        // Assert.
        expect(stateFn).toHaveBeenCalled();
        expect(goToSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                state: expect.objectContaining({
                    // State structure varies by routing universe
                    [hash === false ? 'path' : 'hash']: hash === false
                        ? expect.objectContaining(stateObj)
                        : expect.any(Object)
                })
            })
        );
    });

    test("Should handle replace navigation when replace is true.", async () => {
        // Arrange.
        const { hash, context } = setup;
        const href = "/test/path";
        const goToSpy = vi.spyOn(location, 'goTo');

        const { container } = render(Link, {
            props: { hash, href, replace: true, children: content },
            context
        });
        const anchor = container.querySelector('a');

        // Act.
        await fireEvent.click(anchor!);

        // Assert.
        expect(goToSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ replace: true })
        );
    });
}

function reactivityTests(setup: ReturnType<typeof createRouterTestSetup>) {
    const linkText = "Test Link";
    const content = createTestSnippet(linkText);

    beforeEach(() => {
        setup.init();
    });

    afterAll(() => {
        setup.dispose();
    });

    // Prop Value Changes (Component prop reactivity)
    test("Should update href when href prop changes (rerender).", async () => {
        // Arrange.
        const { hash, context } = setup;
        const initialHref = "/initial/path";
        const updatedHref = "/updated/path";

        const { container, rerender } = render(Link, {
            props: { hash, href: initialHref, children: content },
            context
        });
        const anchor = container.querySelector('a');
        const initialHrefValue = anchor?.getAttribute('href');

        // Act.
        await rerender({ hash, href: updatedHref, children: content });

        // Assert.
        const updatedHrefValue = anchor?.getAttribute('href');
        expect(updatedHrefValue).not.toBe(initialHrefValue);
        expect(updatedHrefValue).toContain('updated/path');
    });

    // Reactive State Changes (Svelte rune reactivity)
    test("Should update href when reactive state changes (signals).", async () => {
        // Arrange.
        const { hash, context } = setup;
        let href = $state("/initial/path");

        const { container } = render(Link, {
            props: { hash, get href() { return href; }, children: content },
            context
        });
        const anchor = container.querySelector('a');
        const initialHrefValue = anchor?.getAttribute('href');

        // Act.
        href = "/updated/path";
        flushSync();

        // Assert.
        const updatedHrefValue = anchor?.getAttribute('href');
        expect(updatedHrefValue).not.toBe(initialHrefValue);
        expect(updatedHrefValue).toContain('updated/path');
    });

    test("Should update classes when activeState prop changes (rerender).", async () => {
        // Arrange.
        const { hash, router, context } = setup;
        const href = "/test/path";
        const activeKey = "test-route";

        // Mock active route status
        if (router) {
            Object.defineProperty(router, 'routeStatus', {
                value: { [activeKey]: { match: true } },
                configurable: true
            });
        }

        const initialActiveState = { class: "initial-active" };
        const updatedActiveState = { class: "updated-active" };

        const { container, rerender } = render(Link, {
            props: {
                hash,
                href,
                activeFor: activeKey,
                activeState: initialActiveState,
                children: content
            },
            context
        });
        const anchor = container.querySelector('a');
        expect(anchor?.className).toContain('initial-active');

        // Act.
        await rerender({ hash, href, activeState: updatedActiveState, children: content });

        // Assert.
        expect(anchor?.className).toContain('updated-active');
        expect(anchor?.className).not.toContain('initial-active');
    });

    test("Should update classes when reactive activeState changes (signals).", async () => {
        // Arrange.
        const { hash, router, context } = setup;
        const href = "/test/path";
        const activeKey = "test-route";

        // Mock active route status
        if (router) {
            Object.defineProperty(router, 'routeStatus', {
                value: { [activeKey]: { match: true } },
                configurable: true
            });
        }

        let activeClass = $state("initial-active");

        const { container } = render(Link, {
            props: {
                hash,
                href,
                activeFor: activeKey,
                get activeState() { return { class: activeClass }; },
                children: content
            },
            context
        });
        const anchor = container.querySelector('a');
        expect(anchor?.className).toContain('initial-active');

        // Act.
        activeClass = "updated-active";
        flushSync();

        // Assert.
        expect(anchor?.className).toContain('updated-active');
        expect(anchor?.className).not.toContain('initial-active');
    });

    test("Should update state when state prop changes (rerender).", async () => {
        // Arrange.
        const { hash, context } = setup;
        const href = "/test/path";
        const initialState = { data: "initial" };
        const updatedState = { data: "updated" };
        const goToSpy = vi.spyOn(location, 'goTo');

        const { container, rerender } = render(Link, {
            props: { hash, href, state: initialState, children: content },
            context
        });
        const anchor = container.querySelector('a');

        // Act.
        await rerender({ hash, href, state: updatedState, children: content });
        await fireEvent.click(anchor!);

        // Assert.
        expect(goToSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                state: expect.objectContaining({
                    [hash === false ? 'path' : 'hash']: hash === false
                        ? expect.objectContaining(updatedState)
                        : expect.any(Object)
                })
            })
        );
    });

    test("Should update state when reactive state changes (signals).", async () => {
        // Arrange.
        const { hash, context } = setup;
        const href = "/test/path";
        let stateData = $state({ data: "initial" });
        const goToSpy = vi.spyOn(location, 'goTo');

        const { container } = render(Link, {
            props: {
                hash,
                href,
                get state() { return stateData; },
                children: content
            },
            context
        });
        const anchor = container.querySelector('a');

        // Act.
        stateData = { data: "updated" };
        flushSync();
        await fireEvent.click(anchor!);

        // Assert.
        expect(goToSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                state: expect.objectContaining({
                    [hash === false ? 'path' : 'hash']: hash === false
                        ? expect.objectContaining({ data: "updated" })
                        : expect.any(Object)
                })
            })
        );
    });

    test("Should update preserveQuery behavior when prop changes (rerender).", async () => {
        // Arrange.
        const { hash, context } = setup;
        const href = "/test/path";

        const { container, rerender } = render(Link, {
            props: { hash, href, preserveQuery: false, children: content },
            context
        });
        const anchor = container.querySelector('a');
        const initialHref = anchor?.getAttribute('href');

        // Act.
        await rerender({ hash, href: href + "?added=param", preserveQuery: true, children: content });

        // Assert.
        const updatedHref = anchor?.getAttribute('href');
        expect(updatedHref).not.toBe(initialHref);
        expect(updatedHref).toContain('added=param');
    });

    test("Should update preserveQuery behavior when reactive state changes (signals).", async () => {
        // Arrange.
        const { hash, context } = setup;
        const baseHref = "/test/path";
        let preserveQuery = $state(false);
        let href = $state(baseHref);

        const { container } = render(Link, {
            props: {
                hash,
                get href() { return href; },
                get preserveQuery() { return preserveQuery; },
                children: content
            },
            context
        });
        const anchor = container.querySelector('a');
        const initialHref = anchor?.getAttribute('href');

        // Act.
        href = baseHref + "?added=param";
        preserveQuery = true;
        flushSync();

        // Assert.
        const updatedHref = anchor?.getAttribute('href');
        expect(updatedHref).not.toBe(initialHref);
        expect(updatedHref).toContain('added=param');
    });
}

function linkContextTests(ru: RoutingUniverse) {
    let browserMocks: ReturnType<typeof setupBrowserMocks>;
    let setup: ReturnType<typeof createRouterTestSetup>;

    beforeEach(() => {
        browserMocks = setupBrowserMocks('http://example.com/', location);
        setup = createRouterTestSetup(ru.hash);
        setup.init();
    });

    afterAll(() => {
        setup.dispose();
    });

    test("Should prepend the parent router's base path when link context demands it.", () => {
        // Arrange.
        const { router, context } = setup;
        router.basePath = '/base';
        const linkCtx: ILinkContext = {
            prependBasePath: true,
        };
        context.set(linkCtxKey, linkCtx);

        // Act.
        const { container } = render(Link, {
            props: {
                hash: ru.hash,
                href: "/test",
            },
            context,
        });

        // Assert.
        const anchor = container.querySelector('a');
        expect(anchor?.getAttribute('href')).toEqual(calculateHref({ hash: ru.hash }, '/base/test'));
    });

    test("Should preserve the query string when link context demands it.", () => {
        // Arrange.
        const { router, context } = setup;
        const queryString = '?a=1&b=2';
        browserMocks.setUrl(`http://example.com/${queryString}`);
        const linkCtx: ILinkContext = {
            preserveQuery: true,
        };
        context.set(linkCtxKey, linkCtx);

        // Act.
        const { container } = render(Link, {
            props: {
                hash: ru.hash,
                href: "/test",
            },
            context,
        });

        // Assert.
        const anchor = container.querySelector('a');
        expect(anchor?.getAttribute('href')).toContain(queryString);
    });

    test("Should apply activeState from link context when link context demands it.", () => {
        // Arrange.
        const { router, context } = setup;
        const linkCtx: ILinkContext = {
            activeState: {
                class: 'context-active',
                aria: { current: 'page' }
            }
        };
        const activeFor = 'test-route';
        addMatchingRoute(router, { name: activeFor });
        context.set(linkCtxKey, linkCtx);

        // Act.
        const { container } = render(Link, {
            props: {
                hash: ru.hash,
                href: "/test",
                activeFor,
            },
            context,
        });

        // Assert.
        const anchor = container.querySelector('a');
        expect(anchor?.className).toContain('context-active');
        expect(anchor?.getAttribute('aria-current')).toBe('page');
    });

    test.each<{
        replace: boolean;
        fnName: 'pushState' | 'replaceState';
    }>([
        { replace: false, fnName: 'pushState' },
        { replace: true, fnName: 'replaceState' }
    ])("Should call $fnName when link context demands it.", async ({ replace, fnName }) => {
        // Arrange.
        const { router, context } = setup;
        const linkCtx: ILinkContext = {
            replace,
        };
        context.set(linkCtxKey, linkCtx);
        const { container } = render(Link, {
            props: {
                hash: ru.hash,
                href: "/test",
            },
            context,
        });
        const anchor = container.querySelector('a');

        // Act.
        await fireEvent.click(anchor!);

        expect(browserMocks.history[fnName]).toHaveBeenCalledOnce();
    });
}

describe("Routing Mode Assertions", () => {
    const linkText = "Test Link";
    const content = createTestSnippet(linkText);
    let cleanup: () => void;

    beforeAll(() => {
        cleanup = init();
    });

    afterEach(() => {
        resetRoutingOptions();
    });

    afterAll(() => {
        cleanup();
    });

    test.each<{
        options: Partial<ExtendedRoutingOptions>;
        hash: typeof ALL_HASHES[keyof typeof ALL_HASHES];
        description: string;
    }>([
        {
            options: { disallowHashRouting: true },
            hash: ALL_HASHES.single,
            description: 'hash routing is disallowed'
        },
        {
            options: { disallowMultiHashRouting: true },
            hash: ALL_HASHES.multi,
            description: 'multi-hash routing is disallowed'
        },
        {
            options: { disallowPathRouting: true },
            hash: ALL_HASHES.path,
            description: 'path routing is disallowed'
        }
    ])("Should throw error when $description and hash=$hash .", ({ options, hash }) => {
        // Arrange
        setRoutingOptions(options);

        // Act & Assert
        expect(() => {
            render(Link, {
                props: {
                    href: "/test",
                    hash,
                    children: content
                },
            });
        }).toThrow();
    });
});

ROUTING_UNIVERSES.forEach(ru => {
    describe(`Link - ${ru.text}`, () => {
        const setup = createRouterTestSetup(ru.hash);
        let cleanup: () => void;

        beforeAll(() => {
            cleanup = init({
                defaultHash: ru.defaultHash,
                hashMode: ru.hashMode,
            });
        });

        afterAll(() => {
            cleanup?.();
        });

        describe("Basic Link Functionality", () => {
            basicLinkTests(setup);
        });

        describe("HREF Calculation", () => {
            hrefCalculationTests(setup);
        });

        describe("Active State Handling", () => {
            activeStateTests(setup);
        });

        describe("State Handling", () => {
            stateHandlingTests(setup);
        });

        describe("Reactivity", () => {
            reactivityTests(setup);
        });
    });
});

ROUTING_UNIVERSES.forEach(ru => {
    describe(`Link Context - ${ru.text}`, () => {
        let cleanup: () => void;
        beforeAll(() => {
            cleanup = init({
                defaultHash: ru.defaultHash,
                hashMode: ru.hashMode,
            });
        });
        afterAll(() => {
            cleanup?.();
        });
        linkContextTests(ru);
    });
});
