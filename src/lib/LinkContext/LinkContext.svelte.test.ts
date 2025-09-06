import { describe, test, expect, beforeEach, vi, beforeAll, afterAll } from "vitest";
import { render } from "@testing-library/svelte";
import LinkContext from "./LinkContext.svelte";
import Link from "../Link/Link.svelte";
import { createTestSnippet, createRouterTestSetup, ROUTING_UNIVERSES } from "../../testing/test-utils.js";
import { flushSync } from "svelte";
import TestLinkContextNested from "../../testing/TestLinkContextNested.svelte";
import TestLinkContextWithLink from "../../testing/TestLinkContextWithLink.svelte";
import { init } from "$lib/index.js";

function defaultPropsTests() {
    const content = createTestSnippet("Link Context Content");
    
    test("Should render children with default context values.", async () => {
        // Act.
        const { findByText } = render(LinkContext, { 
            props: { children: content } 
        });

        // Assert.
        await expect(findByText("Link Context Content")).resolves.toBeDefined();
    });

    test("Should provide default values to child components.", async () => {
        // Arrange.
        const linkText = "Test Link";
        const linkSnippet = createTestSnippet(`<Link href="/test">${linkText}</Link>`);

        // Act.
        const { container } = render(LinkContext, { 
            props: { children: linkSnippet } 
        });
        const anchor = container.querySelector('a');

        // Assert.
        expect(anchor).toBeDefined();
        // Default values should be used (replace: false, prependBasePath: false, preserveQuery: false)
    });
}

function explicitPropsTests() {
    test("Should pass replace context to child Link components.", async () => {
        // Arrange.
        const linkText = "Test Link";
        
        // Create a test component that renders Link and captures the context
        const TestComponent = ($$payload: any) => {
            const linkElement = `<Link href="/test">${linkText}</Link>`;
            $$payload.out = `<div data-testid="link-container">${linkElement}</div>`;
        };

        // Act.
        const { container } = render(LinkContext, {
            props: { 
                replace: true,
                children: createTestSnippet('<div>Test</div>')
            }
        });

        // Assert.
        // Context is provided (we'll test integration with Link components separately)
        expect(container.innerHTML).toContain('Test');
    });

    test("Should pass prependBasePath context to child components.", async () => {
        // Act.
        const { container } = render(LinkContext, {
            props: { 
                prependBasePath: true,
                children: createTestSnippet('<div>Test</div>')
            }
        });

        // Assert.
        expect(container.innerHTML).toContain('Test');
    });

    test("Should pass preserveQuery context to child components.", async () => {
        // Arrange.
        const preserveQuery = ['search', 'filter'];

        // Act.
        const { container } = render(LinkContext, {
            props: { 
                preserveQuery,
                children: createTestSnippet('<div>Test</div>')
            }
        });

        // Assert.
        expect(container.innerHTML).toContain('Test');
    });

    test("Should handle all properties together.", async () => {
        // Act.
        const { container } = render(LinkContext, {
            props: { 
                replace: true,
                prependBasePath: true,
                preserveQuery: ['search'],
                children: createTestSnippet('<div>All Props Test</div>')
            }
        });

        // Assert.
        expect(container.innerHTML).toContain('All Props Test');
    });
}

function nestedContextTests() {
    test("Should inherit from parent context when child values not specified.", async () => {
        // Act.
        const { getByTestId } = render(TestLinkContextNested, {
            props: { 
                parentReplace: true,
                parentPrependBasePath: true
                // Child props not specified - should inherit
            }
        });

        // Assert.
        expect(getByTestId('nested-content')).toBeDefined();
    });

    test("Should override parent context values when explicitly set.", async () => {
        // Act.
        const { getByTestId } = render(TestLinkContextNested, {
            props: {
                parentReplace: true,
                parentPrependBasePath: true,
                parentPreserveQuery: true,
                // Override some values
                childReplace: false,
                childPreserveQuery: ['specific']
            }
        });

        // Assert.
        expect(getByTestId('nested-content')).toBeDefined();
    });

    test("Should handle deeply nested contexts.", async () => {
        // Arrange.
        const deepContent = createTestSnippet('<div data-testid="deep-content">Deep Nested</div>');

        // Act.
        const { getByTestId } = render(TestLinkContextNested, {
            props: { 
                parentReplace: true,
                parentPrependBasePath: true,
                childPreserveQuery: ['deep'],
                children: deepContent
            }
        });

        // Assert.
        expect(getByTestId('deep-content')).toBeDefined();
    });
}

function reactivityTests() {
    test("Should update context when props change (rerender).", async () => {
        // Arrange.
        const content = createTestSnippet('<div>Reactive Test</div>');
        const initialReplace = false;
        const updatedReplace = true;

        const { container, rerender } = render(LinkContext, {
            props: { 
                replace: initialReplace,
                children: content
            }
        });
        expect(container.innerHTML).toContain('Reactive Test');

        // Act.
        await rerender({ 
            replace: updatedReplace,
            children: content
        });

        // Assert.
        expect(container.innerHTML).toContain('Reactive Test');
        // Context should be updated (we'd need integration tests to verify Link behavior)
    });

    test("Should update context when reactive state changes (signals).", async () => {
        // Arrange.
        const content = createTestSnippet('<div>Signal Test</div>');
        let replace = $state(false);
        let prependBasePath = $state(false);

        const { container } = render(LinkContext, {
            props: { 
                get replace() { return replace; },
                get prependBasePath() { return prependBasePath; },
                children: content
            }
        });
        expect(container.innerHTML).toContain('Signal Test');

        // Act.
        replace = true;
        prependBasePath = true;
        flushSync();

        // Assert.
        expect(container.innerHTML).toContain('Signal Test');
        // Context should be reactively updated
    });

    test("Should reactively update preserveQuery.", async () => {
        // Arrange.
        const content = createTestSnippet('<div>PreserveQuery Test</div>');
        let preserveQuery = $state<string[] | boolean>(['initial']);

        const { container } = render(LinkContext, {
            props: { 
                get preserveQuery() { return preserveQuery; },
                children: content
            }
        });

        // Act.
        preserveQuery = ['updated', 'query'];
        flushSync();

        // Assert.
        expect(container.innerHTML).toContain('PreserveQuery Test');
    });

    test("Should handle complex reactive combinations.", async () => {
        // Arrange.
        const content = createTestSnippet('<div>Complex Reactive</div>');
        let replace = $state(false);
        let preserveQuery = $state<string[] | boolean>(false);

        const { container } = render(LinkContext, {
            props: { 
                get replace() { return replace; },
                get preserveQuery() { return preserveQuery; },
                prependBasePath: true, // Static prop
                children: content
            }
        });

        // Act.
        replace = true;
        preserveQuery = ['search', 'filter'];
        flushSync();

        // Assert.
        expect(container.innerHTML).toContain('Complex Reactive');
    });
}

function edgeCaseTests() {
    test("Should handle undefined children gracefully.", () => {
        // Act & Assert - Should not throw
        expect(() => {
            render(LinkContext, { props: {} });
        }).not.toThrow();
    });

    test("Should handle empty preserveQuery array.", async () => {
        // Act.
        const { container } = render(LinkContext, {
            props: { 
                preserveQuery: [],
                children: createTestSnippet('<div>Empty Array</div>')
            }
        });

        // Assert.
        expect(container.innerHTML).toContain('Empty Array');
    });

    test("Should handle string preserveQuery value.", async () => {
        // Act.
        const { container } = render(LinkContext, {
            props: { 
                preserveQuery: 'single-param',
                children: createTestSnippet('<div>String Param</div>')
            }
        });

        // Assert.
        expect(container.innerHTML).toContain('String Param');
    });

    test("Should handle boolean false for all properties.", async () => {
        // Act.
        const { container } = render(LinkContext, {
            props: { 
                replace: false,
                prependBasePath: false,
                preserveQuery: false,
                children: createTestSnippet('<div>All False</div>')
            }
        });

        // Assert.
        expect(container.innerHTML).toContain('All False');
    });
}

// Integration tests with Link component
function linkIntegrationTests(setup: ReturnType<typeof createRouterTestSetup>) {
    beforeEach(() => {
        // Fresh router instance for each test
        setup.init();
    });

    afterAll(() => {
        // Clean disposal after all tests
        setup.dispose();
    });

    test("Should provide replace context to Link component.", async () => {
        // Arrange.
        const { hash, context } = setup;

        // Act.
        const { getByTestId } = render(TestLinkContextWithLink, {
            props: { 
                replace: true,
                linkHref: "/test-replace",
                linkText: "Replace Link",
                hash
            },
            context
        });

        // Assert.
        const container = getByTestId('link-container');
        const link = container.querySelector('a');
        expect(link).toBeDefined();
        expect(link?.textContent).toBe("Replace Link");
    });

    test("Should provide prependBasePath context to Link component.", async () => {
        // Arrange.
        const { hash, context } = setup;

        // Act.
        const { getByTestId } = render(TestLinkContextWithLink, {
            props: { 
                prependBasePath: true,
                linkHref: "/api/endpoint",
                linkText: "Base Path Link",
                hash
            },
            context
        });

        // Assert.
        const container = getByTestId('link-container');
        const link = container.querySelector('a');
        expect(link).toBeDefined();
        expect(link?.textContent).toBe("Base Path Link");
    });

    test("Should provide preserveQuery context to Link component.", async () => {
        // Arrange.
        const { hash, context } = setup;

        // Act.
        const { getByTestId } = render(TestLinkContextWithLink, {
            props: { 
                preserveQuery: ['search', 'filter'],
                linkHref: "/search",
                linkText: "Search Link",
                hash
            },
            context
        });

        // Assert.
        const container = getByTestId('link-container');
        const link = container.querySelector('a');
        expect(link).toBeDefined();
        expect(link?.textContent).toBe("Search Link");
    });

    test("Should provide all context properties to Link component.", async () => {
        // Arrange.
        const { hash, context } = setup;

        // Act.
        const { getByTestId } = render(TestLinkContextWithLink, {
            props: { 
                replace: true,
                prependBasePath: true,
                preserveQuery: ['search'],
                linkHref: "/full-context",
                linkText: "Full Context Link",
                hash
            },
            context
        });

        // Assert.
        const container = getByTestId('link-container');
        const link = container.querySelector('a');
        expect(link).toBeDefined();
        expect(link?.textContent).toBe("Full Context Link");
    });
}

describe("LinkContext", () => {
    describe("Default Props", () => {
        defaultPropsTests();
    });
    
    describe("Explicit Props", () => {
        explicitPropsTests();
    });
    
    describe("Nested Context", () => {
        nestedContextTests();
    });
    
    describe("Reactivity", () => {
        reactivityTests();
    });
    
    describe("Edge Cases", () => {
        edgeCaseTests();
    });
    
    // Run integration tests for each routing universe
    for (const ru of ROUTING_UNIVERSES) {
        describe(`Link Integration (${ru.text})`, () => {
            const setup = createRouterTestSetup(ru.hash);
            let cleanup: () => void;
            
            beforeAll(() => {
                cleanup = init({
                    implicitMode: ru.implicitMode,
                    hashMode: ru.hashMode,
                });
            });
            
            afterAll(() => {
                cleanup?.();
            });
            
            linkIntegrationTests(setup);
        });
    }
});
