import { describe, test, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte";
import { linkCtxKey, type ILinkContext } from "./LinkContext.svelte";
import TestLinkContextWithContextSpy from "$test/TestLinkContextWithContextSpy.svelte";
import { flushSync } from "svelte";
import type { ActiveStateAriaAttributes } from "$lib/types.js";

describe("LinkContext", () => {
    afterEach(() => {
        vi.resetAllMocks();
    });
    test("Should set the link context with the expected properties and default values.", async () => {
        // Arrange.
        let linkCtx: ILinkContext | undefined;

        // Act.
        render(TestLinkContextWithContextSpy, {
            props: {
                get linkCtx() { return linkCtx; },
                set linkCtx(v) { linkCtx = v; },
            }
        });

        // Assert.
        expect(linkCtx).toBeDefined();
        expect(linkCtx?.replace).toBeUndefined();
        expect(linkCtx?.prependBasePath).toBeUndefined();
        expect(linkCtx?.preserveQuery).toBeUndefined();
        expect(linkCtx?.activeState).toBeUndefined();
        expect(linkCtx?.activeStateAria).toBeUndefined();
    });

    test("Should transmit via context the explicitly set properties.", () => {
        // Arrange.
        let linkCtx: ILinkContext | undefined;
        const ctxProps: ILinkContext = {
            replace: true,
            prependBasePath: true,
            preserveQuery: ['search', 'filter'],
            activeState: { class: "active-link", style: "color: red;", aria: { current: 'page' } }
        }

        // Act.
        render(TestLinkContextWithContextSpy, {
            props: {
                ...ctxProps,
                get linkCtx() { return linkCtx; },
                set linkCtx(v) { linkCtx = v; }
            }
        });

        // Assert.
        expect(linkCtx).toBeDefined();
        expect(linkCtx?.activeState).to.deep.equal(ctxProps.activeState);
        expect(linkCtx?.replace).toBe(ctxProps.replace);
        expect(linkCtx?.prependBasePath).toBe(ctxProps.prependBasePath);
        expect(linkCtx?.preserveQuery).toEqual(ctxProps.preserveQuery);
    });

    test("Should inherit from parent context when no properties are specified.", () => {
        // Arrange.
        const parentCtx: ILinkContext = {
            replace: true,
            prependBasePath: true,
            preserveQuery: ['search', 'filter'],
            activeState: { class: "active-link", style: "color: red;", aria: { current: 'page' } }
        };
        const context = new Map();
        context.set(linkCtxKey, parentCtx);
        let linkCtx: ILinkContext | undefined;

        // Act.
        render(TestLinkContextWithContextSpy, {
            props: {
                get linkCtx() { return linkCtx; },
                set linkCtx(v) { linkCtx = v; }
            },
            context
        });

        // Assert.
        expect(linkCtx).toBeDefined();
        // expect(linkCtx?.activeState).toEqual(parentCtx.activeState);
        expect(linkCtx?.replace).toEqual(parentCtx.replace);
        expect(linkCtx?.prependBasePath).toEqual(parentCtx.prependBasePath);
        expect(linkCtx?.preserveQuery).toEqual(parentCtx.preserveQuery);
    });

    test.each<{
        property: keyof ILinkContext;
        parentValue: any;
        value: any;
    }>([
        {
            property: 'activeState',
            parentValue: { class: "active-link", style: "color: red;", aria: { 'aria-current': 'page' } },
            value: { class: 'some-other', aria: { 'aria-current': 'step' } },
        },
        {
            property: 'prependBasePath',
            parentValue: true,
            value: false,
        },
        {
            property: 'preserveQuery',
            parentValue: 'search',
            value: false,
        },
        {
            property: 'replace',
            parentValue: false,
            value: true,
        },
    ])("Should override the parent context value for $property when set as a property.", ({ property, parentValue, value }) => {
        // Arrange.
        const parentCtx: ILinkContext = {
            replace: true,
            prependBasePath: true,
            preserveQuery: ['search', 'filter'],
            [property]: parentValue
        };
        const context = new Map();
        context.set(linkCtxKey, parentCtx);
        let linkCtx: ILinkContext | undefined;

        // Act.
        render(TestLinkContextWithContextSpy, {
            props: {
                [property]: value,
                get linkCtx() { return linkCtx; },
                set linkCtx(v) { linkCtx = v; }
            },
            context
        });

        // Assert.
        for (let prop of Object.keys(parentCtx) as (keyof ILinkContext)[]) {
            if (prop === property) {
                expect(linkCtx?.[prop]).toEqual(value);
            }
            else {
                expect(linkCtx?.[prop]).toEqual(parentCtx[prop]);
            }
        }
    });

    describe("Reactivity", () => {
        test.each<{
            property: keyof ILinkContext,
            initial: any,
            updated: any
        }>([
            {
                property: 'activeState',
                initial: { class: "initial-active" },
                updated: { class: "updated-active", style: "color: blue;" },
            },
            {
                property: 'prependBasePath',
                initial: true,
                updated: false,
            },
            {
                property: 'preserveQuery',
                initial: true,
                updated: 'debug',
            },
            {
                property: 'replace',
                initial: false,
                updated: true,
            },
        ])("Should update context when property $property changes.", async ({ property, initial, updated }) => {
            // Arrange.
            let linkCtx: ILinkContext | undefined;
            const { rerender } = render(TestLinkContextWithContextSpy, {
                props: {
                    [property]: initial,
                    get linkCtx() { return linkCtx; },
                    set linkCtx(v) { linkCtx = v; }
                }
            });

            // Act.
            await rerender({ [property]: updated });

            // Assert.
            expect(linkCtx).toBeDefined();
            expect(linkCtx?.[property]).toEqual(updated);
        });
        test("Should calculate expanded aria attributes from the values in activeState.aria.", () => {
            // Arrange.
            let linkCtx: ILinkContext | undefined;
            const ctxProps: ILinkContext = {
                activeState: { aria: { current: 'location' } }
            };

            // Act.
            render(TestLinkContextWithContextSpy, {
                props: {
                    ...ctxProps,
                    get linkCtx() { return linkCtx; },
                    set linkCtx(v) { linkCtx = v; }
                }
            });

            // Assert.
            expect(linkCtx).toBeDefined();
            expect(linkCtx?.activeStateAria).toEqual({ 'aria-current': 'location' });
        });
        test("Should update activeStateAria when activeState.aria changes (re-render).", async () => {
            // Arrange.
            let linkCtx: ILinkContext | undefined;
            const { rerender } = render(TestLinkContextWithContextSpy, {
                props: {
                    activeState: { aria: { current: 'location' } },
                    get linkCtx() { return linkCtx; },
                    set linkCtx(v) { linkCtx = v; }
                }
            });
            expect(linkCtx).toBeDefined();
            expect(linkCtx?.activeStateAria).toEqual({ 'aria-current': 'location' });

            // Act.
            await rerender({ activeState: { aria: { current: 'page' } } });

            // Assert.
            expect(linkCtx).toBeDefined();
            expect(linkCtx?.activeStateAria).toEqual({ 'aria-current': 'page' });
        });
        test("Should update activeStateAria when activeState.aria changes (state change).", () => {
            // Arrange.
            let linkCtx: ILinkContext | undefined;
            let aria = $state<ActiveStateAriaAttributes>({ current: 'location' });
            render(TestLinkContextWithContextSpy, {
                props: {
                    activeState: { aria },
                    get linkCtx() { return linkCtx; },
                    set linkCtx(v) { linkCtx = v; }
                }
            });
            expect(linkCtx).toBeDefined();
            expect(linkCtx?.activeStateAria).toEqual({ 'aria-current': 'location' });

            // Act.
            aria.current = 'page';
            flushSync();

            // Assert.
            expect(linkCtx).toBeDefined();
            expect(linkCtx?.activeStateAria).toEqual({ 'aria-current': 'page' });
        });
    });

    describe('Parent Context Reactivity', () => {
        test.each<{
            property: Exclude<keyof ILinkContext, 'activeStateAria'>,
            initial: any,
            updated: any
        }>([
            {
                property: 'activeState',
                initial: { class: "initial-active" },
                updated: { class: "updated-active", style: "color: blue;" },
            },
            {
                property: 'prependBasePath',
                initial: true,
                updated: false,
            },
            {
                property: 'preserveQuery',
                initial: true,
                updated: ['my', 'values'],
            },
            {
                property: 'replace',
                initial: false,
                updated: true,
            }
        ])("Should update $property when not overridden and changes in the parent.", ({ property, initial, updated }) => {
            // Arrange.
            const parentCtx = $state<ILinkContext>({
                [property]: initial,
            });
            const context = new Map();
            context.set(linkCtxKey, parentCtx);
            let linkCtx: ILinkContext | undefined;
            render(TestLinkContextWithContextSpy, {
                props: {
                    get linkCtx() { return linkCtx; },
                    set linkCtx(v) { linkCtx = v; }
                },
                context
            });

            // Act.
            parentCtx[property] = updated;
            flushSync();

            // Assert.
            expect(linkCtx).toBeDefined();
            expect(linkCtx?.[property]).toEqual(updated);
        });
    });
});
