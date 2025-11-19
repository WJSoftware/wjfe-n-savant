import { describe, test, expect, beforeEach, vi } from "vitest";
import { activeBehavior } from "./active.svelte.js";
import { RouterEngine } from "$lib/kernel/RouterEngine.svelte.js";
import type { ActiveState, RouteStatus } from "$lib/types.js";
import { render } from "@testing-library/svelte";
import TestActiveBehavior from "$test/TestActiveBehavior.svelte";
import { flushSync } from "svelte";
import type { ClassValue } from "svelte/elements";
import { clsx } from "clsx";

describe("activeBehavior", () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
        // Create a fresh mock element for each test
        mockElement = {
            setAttribute: vi.fn(),
            removeAttribute: vi.fn(),
            classList: {
                add: vi.fn(),
                remove: vi.fn()
            }
        } as unknown as HTMLElement;
    });

    describe("Basic functionality", () => {
        test("Should apply styles and classes when route is active.", () => {
            // Arrange
            const routeKey = "test-route";
            const routeStatus: Record<string, RouteStatus> = {
                [routeKey]: {
                    match: true,
                    routeParams: undefined
                }
            };
            const activeState: ActiveState & { key: string } = {
                key: routeKey,
                class: "active-class",
                style: "color: red;"
            };
            const baseStyle = "background: white;";

            // Act
            const attachment = activeBehavior(routeStatus, activeState, baseStyle);
            attachment(mockElement);

            // Assert
            expect(mockElement.setAttribute).toHaveBeenCalledWith('style', 'background: white; color: red;');
            expect(mockElement.classList.add).toHaveBeenCalledWith('active-class');
        });
        test.each<{
            text: string;
            classValue: ClassValue
        }>([
            {
                text: "string",
                classValue: "single-class",
            },
            {
                text: "object",
                classValue: { active: true, },
            },
            {
                text: "array",
                classValue: ["class1", "class2"],
            },
        ])("Should apply classes provided in $text form when route is active.", ({ classValue }) => {
            // Arrange.
            const routeKey = "test-route";
            const routeStatus: Record<string, RouteStatus> = {
                [routeKey]: {
                    match: true,
                    routeParams: undefined
                }
            };
            const activeState: ActiveState & { key: string } = {
                key: routeKey,
                class: classValue,
            };

            // Act.
            const attachment = activeBehavior(routeStatus, activeState);
            attachment(mockElement);

            // Assert.
            const expectedClass = clsx(classValue).split(' ');
            expect(mockElement.classList.add).toHaveBeenCalledWith(...expectedClass);
        });
        test("Should return a cleanup function when route is active.", () => {
            // Arrange
            const routeKey = "test-route";
            const routeStatus: Record<string, RouteStatus> = {
                [routeKey]: {
                    match: true,
                    routeParams: undefined
                }
            };
            const activeState: ActiveState & { key: string } = {
                key: routeKey,
                class: "active-class",
                style: "color: red;"
            };
            const baseStyle = "background: white;";
            const attachment = activeBehavior(routeStatus, activeState, baseStyle);

            // Act
            const cleanup = attachment(mockElement);

            // Assert
            expect(typeof cleanup).toBe('function');
        });
        test("Should not return a cleanup function when route is not active.", () => {
            // Arrange
            const routeStatus: Record<string, RouteStatus> = {}; // Empty - route not found
            const activeState: ActiveState & { key: string } = {
                key: "test-route",
                class: "active-class",
                style: "color: red;"
            };
            const baseStyle = "background: white;";
            const attachment = activeBehavior(routeStatus, activeState, baseStyle);
            const cleanup = attachment(mockElement);

            // Assert
            expect(cleanup).toBeUndefined(); // Should not return a function when route is not active
            expect(mockElement.setAttribute).not.toHaveBeenCalled();
            expect(mockElement.classList.add).not.toHaveBeenCalled();
        });
    });

    describe("Cleanup functionality", () => {
        test("Should restore base style and remove classes when cleanup is called.", () => {
            // Arrange
            const routeKey = "test-route";
            const routeStatus: Record<string, RouteStatus> = {
                [routeKey]: {
                    match: true,
                    routeParams: undefined
                }
            };
            const activeState: ActiveState & { key: string } = {
                key: routeKey,
                class: "active-class",
                style: "color: red;"
            };
            const baseStyle = "background: white;";

            const attachment = activeBehavior(routeStatus, activeState, baseStyle);
            const cleanup = attachment(mockElement);

            // Act
            cleanup?.();

            // Assert
            expect(mockElement.setAttribute).toHaveBeenLastCalledWith('style', baseStyle);
            expect(mockElement.classList.remove).toHaveBeenCalledWith("active-class");
        });

        test("Should restore empty style when no base style is provided.", () => {
            // Arrange
            const routeKey = "test-route";
            const routeStatus: Record<string, RouteStatus> = {
                [routeKey]: {
                    match: true,
                    routeParams: undefined
                }
            };
            const activeState: ActiveState & { key: string } = {
                key: routeKey,
                class: "active-class",
                style: "color: red;"
            };

            const attachment = activeBehavior(routeStatus, activeState); // no baseStyle
            const cleanup = attachment(mockElement);

            // Act
            cleanup?.();

            // Assert
            expect(mockElement.setAttribute).toHaveBeenLastCalledWith('style', '');
            expect(mockElement.classList.remove).toHaveBeenCalledWith("active-class");
        });

        test("Should not perform cleanup operations when route was not active.", () => {
            // Arrange
            const routeStatus: Record<string, RouteStatus> = {}; // Empty - route not found
            const activeState: ActiveState & { key: string } = {
                key: "test-route",
                class: "active-class"
            };

            const attachment = activeBehavior(routeStatus, activeState);
            const cleanup = attachment(mockElement);

            // Act
            cleanup?.();

            // Assert - cleanup should not call setAttribute or classList.remove
            expect(mockElement.setAttribute).not.toHaveBeenCalled();
            expect(mockElement.classList.remove).not.toHaveBeenCalled();
        });
    });

    describe("Input types and edge cases", () => {
        test("Should work with RouterEngine as input.", () => {
            // Arrange
            const routerEngine = {} as RouterEngine; // Mock RouterEngine without construction
            const activeState: ActiveState & { key: string } = {
                key: "test-route",
                class: "active-class"
            };

            // Act
            const attachment = activeBehavior(routerEngine, activeState);
            attachment(mockElement);

            // Assert - should not throw and should not apply styles (no active route)
            expect(mockElement.setAttribute).not.toHaveBeenCalled();
            expect(mockElement.classList.add).not.toHaveBeenCalled();
        });

        test("Should work with null/undefined router input.", () => {
            // Arrange
            const activeState: ActiveState & { key: string } = {
                key: "test-route",
                class: "active-class"
            };

            // Act
            const attachmentNull = activeBehavior(null, activeState);
            const attachmentUndefined = activeBehavior(undefined, activeState);

            attachmentNull(mockElement);
            attachmentUndefined(mockElement);

            // Assert - should not apply styles when router is null/undefined
            expect(mockElement.setAttribute).not.toHaveBeenCalled();
            expect(mockElement.classList.add).not.toHaveBeenCalled();
        });

        test("Should handle activeState with no class property.", () => {
            // Arrange
            const routeKey = "test-route";
            const routeStatus: Record<string, RouteStatus> = {
                [routeKey]: {
                    match: true,
                    routeParams: undefined
                }
            };
            const activeState: ActiveState & { key: string } = {
                key: routeKey,
                style: "color: red;"
            };

            // Act
            const attachment = activeBehavior(routeStatus, activeState);
            attachment(mockElement);

            // Assert - should apply style but not add any class since there's no class property
            expect(mockElement.setAttribute).toHaveBeenCalledWith('style', 'color: red;');
            expect(mockElement.classList.add).not.toHaveBeenCalled();
        });

        test("Should handle activeState with no style property.", () => {
            // Arrange
            const routeKey = "test-route";
            const routeStatus: Record<string, RouteStatus> = {
                [routeKey]: {
                    match: true,
                    routeParams: undefined
                }
            };
            const activeState: ActiveState & { key: string } = {
                key: routeKey,
                class: "active-class"
            };

            // Act
            const attachment = activeBehavior(routeStatus, activeState);
            attachment(mockElement);

            // Assert - should apply class but no style
            expect(mockElement.setAttribute).toHaveBeenCalledWith('style', '');
            expect(mockElement.classList.add).toHaveBeenCalledWith('active-class');
        });

        test("Should handle empty activeState key.", () => {
            // Arrange
            const routeStatus: Record<string, RouteStatus> = {};
            const activeState: ActiveState & { key: string } = {
                key: "",
                class: "active-class"
            };

            // Act
            const attachment = activeBehavior(routeStatus, activeState);
            attachment(mockElement);

            // Assert - should not apply styles with empty key
            expect(mockElement.setAttribute).not.toHaveBeenCalled();
            expect(mockElement.classList.add).not.toHaveBeenCalled();
        });
    });

    describe("Class value processing", () => {
        test.each([
            { classValue: "single-class", description: "string class" },
            { classValue: ["class1", "class2"], description: "array of classes" },
            { classValue: { active: true, disabled: false }, description: "object with boolean values" }
        ])("Should process $description through clsx correctly.", ({ classValue }) => {
            // Arrange
            const routeKey = "test-route";
            const routeStatus: Record<string, RouteStatus> = {
                [routeKey]: {
                    match: true,
                    routeParams: undefined
                }
            };
            const activeState: ActiveState & { key: string } = {
                key: routeKey,
                class: classValue
            };

            // Act
            const attachment = activeBehavior(routeStatus, activeState);
            attachment(mockElement);

            // Assert - clsx should process the class value and add it to classList if non-empty
            const processedClass = clsx(classValue).split(' ').filter(c => c.trim().length > 0);
            expect(mockElement.classList.add).toHaveBeenCalledWith(...processedClass);
        });
    });

    describe("Style handling", () => {
        test("Should handle joinStyles returning null/undefined.", () => {
            // Arrange
            const routeKey = "test-route";
            const routeStatus: Record<string, RouteStatus> = {
                [routeKey]: {
                    match: true,
                    routeParams: undefined
                }
            };
            const activeState: ActiveState & { key: string } = {
                key: routeKey,
                class: "active-class",
                style: "color: red;"
            };

            // Act
            const attachment = activeBehavior(routeStatus, activeState);
            attachment(mockElement);

            // Assert - should handle joinStyles result gracefully
            expect(mockElement.setAttribute).toHaveBeenCalledWith('style', expect.any(String));
        });

        test("Should preserve base style parameter.", () => {
            // Arrange
            const routeKey = "test-route";
            const routeStatus: Record<string, RouteStatus> = {
                [routeKey]: {
                    match: true,
                    routeParams: undefined
                }
            };
            const activeState: ActiveState & { key: string } = {
                key: routeKey,
                class: "active-class",
                style: "color: red;"
            };
            const baseStyle = "background: blue; font-size: 14px;";

            // Act
            const attachment = activeBehavior(routeStatus, activeState, baseStyle);
            const cleanup = attachment(mockElement);

            // Assert: Should combine base style with active style
            expect(mockElement.setAttribute).toHaveBeenCalledWith('style', expect.stringContaining('background: blue'));

            // Act: Test cleanup restores baseStyle
            cleanup?.();

            expect(mockElement.setAttribute).toHaveBeenLastCalledWith('style', baseStyle);
        });

        test("Should default to empty string when no base style is provided.", () => {
            // Arrange
            const routeKey = "test-route";
            const routeStatus: Record<string, RouteStatus> = {
                [routeKey]: {
                    match: true,
                    routeParams: undefined
                }
            };
            const activeState: ActiveState & { key: string } = {
                key: routeKey,
                style: "color: red;"
            };

            // Act
            const attachment = activeBehavior(routeStatus, activeState); // No baseStyle parameter
            attachment(mockElement);

            // Assert - should apply style without base style
            expect(mockElement.setAttribute).toHaveBeenCalledWith('style', 'color: red;');
        });
    });

    describe("ARIA attributes", () => {
        test("Should apply aria attributes when route is active.", () => {
            // Arrange
            const routeKey = "test-route";
            const routeStatus: Record<string, RouteStatus> = {
                [routeKey]: {
                    match: true,
                    routeParams: undefined
                }
            };
            const activeState: ActiveState & { key: string } = {
                key: routeKey,
                class: "active-class",
                style: "color: red;",
                aria: { current: "page", selected: "true" }
            };

            // Act
            const attachment = activeBehavior(routeStatus, activeState);
            attachment(mockElement);

            // Assert
            expect(mockElement.setAttribute).toHaveBeenCalledWith("aria-current", "page");
            expect(mockElement.setAttribute).toHaveBeenCalledWith("aria-selected", "true");
        });

        test("Should not apply aria attributes when route is not active.", () => {
            // Arrange
            const routeStatus: Record<string, RouteStatus> = {}; // Empty - route not found
            const activeState: ActiveState & { key: string } = {
                key: "test-route",
                class: "active-class",
                aria: { current: "page", selected: "true" }
            };

            // Act
            const attachment = activeBehavior(routeStatus, activeState);
            attachment(mockElement);

            // Assert
            expect(mockElement.setAttribute).not.toHaveBeenCalledWith("aria-current", "page");
            expect(mockElement.setAttribute).not.toHaveBeenCalledWith("aria-selected", "true");
        });

        test("Should remove aria attributes during cleanup.", () => {
            // Arrange
            const routeKey = "test-route";
            const routeStatus: Record<string, RouteStatus> = {
                [routeKey]: {
                    match: true,
                    routeParams: undefined
                }
            };
            const activeState: ActiveState & { key: string } = {
                key: routeKey,
                class: "active-class",
                aria: { current: "page", selected: "true" }
            };

            // Act
            const attachment = activeBehavior(routeStatus, activeState);
            const cleanup = attachment(mockElement);
            cleanup?.();

            // Assert
            expect(mockElement.removeAttribute).toHaveBeenCalledWith("aria-current");
            expect(mockElement.removeAttribute).toHaveBeenCalledWith("aria-selected");
        });

        test("Should handle activeState without aria attributes.", () => {
            // Arrange
            const routeKey = "test-route";
            const routeStatus: Record<string, RouteStatus> = {
                [routeKey]: {
                    match: true,
                    routeParams: undefined
                }
            };
            const activeState: ActiveState & { key: string } = {
                key: routeKey,
                class: "active-class",
                style: "color: red;"
                // No aria property
            };

            // Act & Assert - Should not throw
            const attachment = activeBehavior(routeStatus, activeState);
            expect(() => attachment(mockElement)).not.toThrow();
        });

        test("Should handle empty aria object.", () => {
            // Arrange
            const routeKey = "test-route";
            const routeStatus: Record<string, RouteStatus> = {
                [routeKey]: {
                    match: true,
                    routeParams: undefined
                }
            };
            const activeState: ActiveState & { key: string } = {
                key: routeKey,
                class: "active-class",
                aria: {} // Empty aria object
            };

            // Act & Assert - Should not throw
            const attachment = activeBehavior(routeStatus, activeState);
            expect(() => attachment(mockElement)).not.toThrow();
        });
    });

    describe("Reactivity", () => {
        describe("Property Change", () => {
            test("Should apply the new styles whenever 'activeState.style' changes.", async () => {
                // Arrange.
                const newStyle = "color: blue;";
                const routeKey = "home";
                const routeStatus: Record<string, RouteStatus> = {
                    [routeKey]: {
                        match: true,
                        routeParams: undefined
                    }
                };
                const { rerender, getByTestId } = render(TestActiveBehavior, {
                    props: {
                        routeStatus,
                        key: routeKey,
                        activeState: {}
                    }
                });

                // Act.
                await rerender({
                    activeState: { style: newStyle }
                });

                // Assert.
                const el = getByTestId("subject");
                expect(el.getAttribute('style')).toBe(newStyle);
            });

            test("Should apply the new class whenever 'activeState.class' changes.", async () => {
                // Arrange.
                const newClass = "new-active-class";
                const routeKey = "home";
                const routeStatus: Record<string, RouteStatus> = {
                    [routeKey]: {
                        match: true,
                        routeParams: undefined
                    }
                };
                const { rerender, getByTestId } = render(TestActiveBehavior, {
                    props: {
                        routeStatus,
                        key: routeKey,
                        activeState: {}
                    }
                });

                // Act.
                await rerender({
                    activeState: { class: newClass }
                });

                // Assert.
                const el = getByTestId("subject");
                expect(el.classList.contains(newClass)).toBe(true);
            });

            test("Should apply new ARIA attributes whenever 'activeState.aria' changes.", async () => {
                // Arrange.
                const newAria = { current: "page" as const, selected: true };
                const routeKey = "home";
                const routeStatus: Record<string, RouteStatus> = {
                    [routeKey]: {
                        match: true,
                        routeParams: undefined
                    }
                };
                const { rerender, getByTestId } = render(TestActiveBehavior, {
                    props: {
                        routeStatus,
                        key: routeKey,
                        activeState: {}
                    }
                });

                // Act.
                await rerender({
                    activeState: { aria: newAria }
                });

                // Assert.
                const el = getByTestId("subject");
                expect(el.getAttribute("aria-current")).toBe("page");
                expect(el.getAttribute("aria-selected")).toBe("true");
            });

            test("Should remove styles when route becomes inactive.", async () => {
                // Arrange.
                const routeKey = "home";
                const activeRouteStatus: Record<string, RouteStatus> = {
                    [routeKey]: {
                        match: true,
                        routeParams: undefined
                    }
                };
                const inactiveRouteStatus: Record<string, RouteStatus> = {}; // No matching route
                const { rerender, getByTestId } = render(TestActiveBehavior, {
                    props: {
                        routeStatus: activeRouteStatus,
                        key: routeKey,
                        activeState: { style: "color: red;", class: "active-class" }
                    }
                });

                // Act.
                await rerender({
                    routeStatus: inactiveRouteStatus,
                });

                // Assert.
                const el = getByTestId("subject");
                expect(el.getAttribute('style')).toBe(''); // When inactive, no style is applied
                expect(el.classList.contains("active-class")).toBe(false);
            });

            test("Should apply new base style when route is inactive then becomes active.", async () => {
                // Arrange.
                const initialBaseStyle = "background: white;";
                const newBaseStyle = "background: gray; margin: 10px;";
                const routeKey = "home";
                const inactiveRouteStatus: Record<string, RouteStatus> = {}; // No matching route
                const activeRouteStatus: Record<string, RouteStatus> = {
                    [routeKey]: {
                        match: true,
                        routeParams: undefined
                    }
                };
                const { rerender, getByTestId } = render(TestActiveBehavior, {
                    props: {
                        routeStatus: inactiveRouteStatus,
                        key: routeKey,
                        activeState: { style: "color: red;" },
                        style: initialBaseStyle
                    }
                });

                // Initially should have no style since route is inactive
                let el = getByTestId("subject");
                expect(el.getAttribute('style')).toBe(null);

                // Act 1 - Change base style while inactive
                await rerender({
                    routeStatus: inactiveRouteStatus,
                    key: routeKey,
                    activeState: { style: "color: red;" },
                    style: newBaseStyle
                });

                // Still inactive - no immediate visual change
                el = getByTestId("subject");
                expect(el.getAttribute('style')).toBe(null);

                // Act 2 - Activate route
                await rerender({
                    routeStatus: activeRouteStatus,
                    key: routeKey,
                    activeState: { style: "color: red;" },
                    style: newBaseStyle
                });

                // Assert - should now show the updated base style + active style
                el = getByTestId("subject");
                expect(el.getAttribute('style')).toBe("background: gray; margin: 10px; color: red;");
            });

            test("Should preserve new base style when route becomes active then inactive (baseStyle is reactive).", async () => {
                // Arrange.
                const initialBaseStyle = "background: white;";
                const newBaseStyle = "background: gray; margin: 10px;";
                const routeKey = "home";
                const inactiveRouteStatus: Record<string, RouteStatus> = {};
                const activeRouteStatus: Record<string, RouteStatus> = {
                    [routeKey]: {
                        match: true,
                        routeParams: undefined
                    }
                };
                const { rerender, getByTestId } = render(TestActiveBehavior, {
                    props: {
                        routeStatus: inactiveRouteStatus,
                        key: routeKey,
                        activeState: { style: "color: red;" },
                        style: initialBaseStyle
                    }
                });

                // Act 1 - Change base style while inactive
                await rerender({
                    routeStatus: inactiveRouteStatus,
                    key: routeKey,
                    activeState: { style: "color: red;" },
                    style: newBaseStyle
                });

                // Act 2 - Activate route
                await rerender({
                    routeStatus: activeRouteStatus,
                    key: routeKey,
                    activeState: { style: "color: red;" },
                    style: newBaseStyle
                });

                // Should have combined styles
                let el = getByTestId("subject");
                expect(el.getAttribute('style')).toBe("background: gray; margin: 10px; color: red;");

                // Act 3 - Deactivate route
                await rerender({
                    routeStatus: inactiveRouteStatus,
                    key: routeKey,
                    activeState: { style: "color: red;" },
                    style: newBaseStyle
                });

                // Assert - should restore the new base style (baseStyle is reactive!)
                el = getByTestId("subject");
                expect(el.getAttribute('style')).toBe(newBaseStyle);
            });

            test("Should handle base style changes while route is active.", async () => {
                // Arrange.
                const initialBaseStyle = "background: white;";
                const newBaseStyle = "background: gray; margin: 10px;";
                const routeKey = "home";
                const activeRouteStatus: Record<string, RouteStatus> = {
                    [routeKey]: {
                        match: true,
                        routeParams: undefined
                    }
                };
                const { rerender, getByTestId } = render(TestActiveBehavior, {
                    props: {
                        routeStatus: activeRouteStatus,
                        key: routeKey,
                        activeState: { style: "color: red;" },
                        style: initialBaseStyle
                    }
                });

                // Initially active with initial base style
                let el = getByTestId("subject");
                expect(el.getAttribute('style')).toBe("background: white; color: red;");

                // Act - Change base style while active
                await rerender({
                    routeStatus: activeRouteStatus,
                    key: routeKey,
                    activeState: { style: "color: red;" },
                    style: newBaseStyle
                });

                // Assert - should have new combined style
                el = getByTestId("subject");
                expect(el.getAttribute('style')).toBe("background: gray; margin: 10px; color: red;");
            });
        });

        describe("State Change", () => {
            test("Should apply the new styles whenever 'activeState.style' changes.", () => {
                // Arrange.
                const newStyle = "color: blue;";
                const routeKey = "home";
                const routeStatus = $state<Record<string, RouteStatus>>({
                    [routeKey]: {
                        match: true,
                        routeParams: undefined
                    }
                });
                const activeState = $state<ActiveState>({});
                const key = $state(routeKey);
                const { getByTestId } = render(TestActiveBehavior, {
                    props: {
                        routeStatus,
                        key,
                        activeState
                    }
                });

                // Act.
                activeState.style = newStyle;
                flushSync();

                // Assert.
                const el = getByTestId("subject");
                expect(el.getAttribute('style')).toBe(newStyle);
            });

            test("Should apply the new class whenever 'activeState.class' changes.", () => {
                // Arrange.
                const newClass = "new-active-class";
                const routeKey = "home";
                const routeStatus = $state<Record<string, RouteStatus>>({
                    [routeKey]: {
                        match: true,
                        routeParams: undefined
                    }
                });
                const activeState = $state<ActiveState>({});
                const key = $state(routeKey);
                const { getByTestId } = render(TestActiveBehavior, {
                    props: {
                        routeStatus,
                        key,
                        activeState
                    }
                });

                // Act.
                activeState.class = newClass;
                flushSync();

                // Assert.
                const el = getByTestId("subject");
                expect(el.classList.contains(newClass)).toBe(true);
            });

            test("Should apply new ARIA attributes whenever 'activeState.aria' changes.", () => {
                // Arrange.
                const newAria = { current: "page" as const, selected: true };
                const routeKey = "home";
                const routeStatus = $state<Record<string, RouteStatus>>({
                    [routeKey]: {
                        match: true,
                        routeParams: undefined
                    }
                });
                const activeState = $state<ActiveState>({});
                const key = $state(routeKey);
                const { getByTestId } = render(TestActiveBehavior, {
                    props: {
                        routeStatus,
                        key,
                        activeState
                    }
                });

                // Act.
                activeState.aria = newAria;
                flushSync();

                // Assert.
                const el = getByTestId("subject");
                expect(el.getAttribute("aria-current")).toBe("page");
                expect(el.getAttribute("aria-selected")).toBe("true");
            });

            test("Should respond to routeStatus changes.", () => {
                // Arrange.
                const routeKey = "home";
                const routeStatus = $state<Record<string, RouteStatus>>({});
                const activeState = $state<ActiveState>({
                    style: "color: red;",
                    class: "active-class"
                });
                const key = $state(routeKey);
                const { getByTestId } = render(TestActiveBehavior, {
                    props: {
                        routeStatus,
                        key,
                        activeState
                    }
                });

                // Initially inactive
                let el = getByTestId("subject");
                expect(el.getAttribute('style')).toBe(null);
                expect(el.classList.contains("active-class")).toBe(false);

                // Act - activate route
                routeStatus[routeKey] = {
                    match: true,
                    routeParams: undefined
                };
                flushSync();

                // Assert.
                el = getByTestId("subject");
                expect(el.getAttribute('style')).toBe("color: red;");
                expect(el.classList.contains("active-class")).toBe(true);
            });

            test("Should respond to key changes.", () => {
                // Arrange.
                const oldKey = "home";
                const newKey = "about";
                const routeStatus = $state<Record<string, RouteStatus>>({
                    [newKey]: {
                        match: true,
                        routeParams: undefined
                    }
                });
                const activeState = $state<ActiveState>({
                    style: "color: red;",
                    class: "active-class"
                });
                let key = $state(oldKey); // Start with inactive key
                const { getByTestId } = render(TestActiveBehavior, {
                    props: {
                        routeStatus,
                        get key() { return key; },
                        activeState,
                    }
                });

                // Initially inactive
                let el = getByTestId("subject");
                expect(el.getAttribute('style')).toBe(null);
                expect(el.classList.contains("active-class")).toBe(false);

                // Act - change key to active one
                key = newKey;
                flushSync();

                // Assert.
                el = getByTestId("subject");
                expect(el.getAttribute('style')).toBe("color: red;");
                expect(el.classList.contains("active-class")).toBe(true);
            });
            
            test("Should apply new base style when route is inactive then becomes active.", () => {
                // Arrange.
                const routeKey = "home";
                const routeStatus = $state<Record<string, RouteStatus>>({});
                const activeState = $state<ActiveState>({ style: "color: red;" });
                const key = $state(routeKey);
                let baseStyle = $state("background: white;");

                const { getByTestId } = render(TestActiveBehavior, {
                    props: {
                        get routeStatus() { return routeStatus; },
                        get key() { return key; },
                        get activeState() { return activeState; },
                        get style() { return baseStyle; }
                    }
                });

                // Initially inactive - no style applied
                let el = getByTestId("subject");
                expect(el.getAttribute('style')).toBe(null);

                // Act 1 - Change base style while inactive
                baseStyle = "background: gray; margin: 10px;";
                flushSync();

                // Still inactive - no immediate visual change
                el = getByTestId("subject");
                expect(el.getAttribute('style')).toBe(null);

                // Act 2 - Activate route
                routeStatus[routeKey] = {
                    match: true,
                    routeParams: undefined
                };
                flushSync();

                // Assert - should now show the updated base style + active style
                el = getByTestId("subject");
                expect(el.getAttribute('style')).toBe("background: gray; margin: 10px; color: red;");
            });

            test("Should preserve new base style through active/inactive transitions (baseStyle is reactive).", () => {
                // Arrange.
                const routeKey = "home";
                const routeStatus = $state<Record<string, RouteStatus>>({});
                const activeState = $state<ActiveState>({ style: "color: red;" });
                const key = $state(routeKey);
                let baseStyle = $state("background: white;");

                const { getByTestId } = render(TestActiveBehavior, {
                    props: {
                        get routeStatus() { return routeStatus; },
                        get key() { return key; },
                        get activeState() { return activeState; },
                        get style() { return baseStyle; }
                    }
                });

                // Act 1 - Change base style while inactive
                baseStyle = "background: gray; margin: 10px;";
                flushSync();

                // Act 2 - Activate route
                routeStatus[routeKey] = {
                    match: true,
                    routeParams: undefined
                };
                flushSync();

                // Should have combined styles
                let el = getByTestId("subject");
                expect(el.getAttribute('style')).toBe("background: gray; margin: 10px; color: red;");

                // Act 3 - Deactivate route
                delete routeStatus[routeKey];
                flushSync();

                // Assert - should restore the new base style (baseStyle is reactive!)
                el = getByTestId("subject");
                expect(el.getAttribute('style')).toBe("background: gray; margin: 10px;");
            });

            test("Should handle base style changes while route is active.", () => {
                // Arrange.
                const routeKey = "home";
                const routeStatus = $state<Record<string, RouteStatus>>({
                    [routeKey]: {
                        match: true,
                        routeParams: undefined
                    }
                });
                const activeState = $state<ActiveState>({ style: "color: red;" });
                const key = $state(routeKey);
                let baseStyle = $state("background: white;");

                const { getByTestId } = render(TestActiveBehavior, {
                    props: {
                        get routeStatus() { return routeStatus; },
                        get key() { return key; },
                        get activeState() { return activeState; },
                        get style() { return baseStyle; }
                    }
                });

                // Initially active with initial base style
                let el = getByTestId("subject");
                expect(el.getAttribute('style')).toBe("background: white; color: red;");

                // Act - Change base style while active
                baseStyle = "background: gray; margin: 10px;";
                flushSync();

                // Assert - should have new combined style
                el = getByTestId("subject");
                expect(el.getAttribute('style')).toBe("background: gray; margin: 10px; color: red;");
            });
        });
    });
});
