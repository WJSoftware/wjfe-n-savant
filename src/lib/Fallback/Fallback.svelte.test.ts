import { init } from "$lib/index.js";
import { describe, test, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { render } from "@testing-library/svelte";
import Fallback from "./Fallback.svelte";
import { addMatchingRoute, addRoutes, createRouterTestSetup, createTestSnippet, ROUTING_UNIVERSES } from "$lib/testing/test-utils.js";
import { flushSync } from "svelte";

function defaultPropsTests(setup: ReturnType<typeof createRouterTestSetup>) {
    const contentText = "Fallback content.";
    const content = createTestSnippet(contentText);
    
    beforeEach(() => {
        // Fresh router instance for each test
        setup.init();
    });
    
    afterAll(() => {
        // Clean disposal after all tests
        setup.dispose();
    });
    
    test("Should render whenever the parent router matches no routes.", async () => {
        // Arrange.
        const { hash, router, context } = setup;

        // Act.
        const { findByText } = render(Fallback, { props: { hash, children: content }, context });

        // Assert.
        await expect(findByText(contentText)).resolves.toBeDefined();
    });
    
    test("Should not render whenever the parent router matches at least one route.", async () => {
        // Arrange.
        const { hash, router, context } = setup;
        addMatchingRoute(router);

        // Act.
        const { queryByText } = render(Fallback, { props: { hash, children: content }, context });

        // Assert.
        expect(queryByText(contentText)).toBeNull();
    });
}

function explicitPropsTests(setup: ReturnType<typeof createRouterTestSetup>) {
    const contentText = "Fallback content.";
    const content = createTestSnippet(contentText);

    beforeEach(() => {
        // Fresh router instance for each test
        setup.init();
    });

    afterAll(() => {
        // Clean disposal after all tests
        setup.dispose();
    });

    test.each([
        {
            routes: {
                matching: 1
            },
            text: "matching routes"
        },
        {
            routes: {
                nonMatching: 1
            },
            text: "no matching routes"
        }
    ])("Should render when the 'when' predicate returns true when there are $text .", async ({ routes }) => {
        // Arrange.
        const { hash, router, context } = setup;
        addRoutes(router, routes);

        // Act.
        const { findByText } = render(Fallback, {
            props: { hash, when: () => true, children: content },
            context
        });

        // Assert.
        await expect(findByText(contentText)).resolves.toBeDefined();
    });
    test.each([
        {
            routes: {
                matching: 1
            },
            text: "matching routes"
        },
        {
            routes: {
                nonMatching: 1
            },
            text: "no matching routes"
        }
    ])("Should not render when the 'when' predicate returns false when there are $text .", async ({ routes }) => {
        // Arrange.
        const { hash, router, context } = setup;
        addRoutes(router, routes);

        // Act.
        const { queryByText } = render(Fallback, {
            props: { hash, when: () => false, children: content },
            context
        });

        // Assert.
        expect(queryByText(contentText)).toBeNull();
    });
}

function reactivityTests(setup: ReturnType<typeof createRouterTestSetup>) {
    const contentText = "Fallback content.";
    const content = createTestSnippet(contentText);

    beforeEach(() => {
        // Fresh router instance for each test
        setup.init();
    });

    afterAll(() => {
        // Clean disposal after all tests
        setup.dispose();
    });

    test("Should re-render when the 'when' predicate function is exchanged.", async () => {
        // Arrange.
        const { hash, router, context } = setup;
        const { findByText, queryByText, rerender } = render(Fallback, {
            props: { hash, when: () => false, children: content },
            context
        });
        expect(queryByText(contentText)).toBeNull();

        // Act.
        await rerender({ hash, when: () => true, children: content });

        // Assert.
        await expect(findByText(contentText)).resolves.toBeDefined();
    });
    test("Should re-render when the 'when' predicate function reactively changes its return value.", async () => {
        // Arrange.
        const { hash, router, context } = setup;
        let rv = $state(false);
        const { findByText, queryByText, rerender } = render(Fallback, {
            props: { hash, when: () => rv, children: content },
            context
        });
        expect(queryByText(contentText)).toBeNull();

        // Act.
        rv = true;
        flushSync();

        // Assert.
        await expect(findByText(contentText)).resolves.toBeDefined();
    });
}

ROUTING_UNIVERSES.forEach(ru => {
    describe(`Fallback - ${ru.text}`, () => {
        const setup = createRouterTestSetup(ru.hash);
        let cleanup: () => void;
        beforeAll(() => {
            cleanup = init({
                implicitMode: ru.implicitMode,
                hashMode: ru.hashMode,
            });
        });
        afterAll(() => {
            cleanup();
        });
        describe("Default Props", () => {
            defaultPropsTests(setup);
        });
        describe("Explicit Props", () => {
            explicitPropsTests(setup);
        });
        describe("Reactivity", () => {
            reactivityTests(setup);
        });
    });
});
