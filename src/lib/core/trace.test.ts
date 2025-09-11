import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { getAllChildRouters, registerRouter, resetTraceOptions, setTraceOptions, traceOptions } from "./trace.svelte.js";
import { RouterEngine } from "./RouterEngine.svelte.js";
import { init } from "$lib/index.js";

vi.mock(import('./trace.svelte.js'), async (importActual) => {
    const actual = await importActual<typeof import("./trace.svelte.js")>();
    return {
        ...actual,
        registerRouter: vi.fn(actual.registerRouter)
    };
});

describe('setTraceOptions', () => {
    test.each([
        true,
        false
    ])("Should set the 'routerHierarchy' option to %s.", (value) => {
        // Act.
        setTraceOptions({ routerHierarchy: value });

        // Assert.
        expect(traceOptions.routerHierarchy).toBe(value);
    });
});

describe('resetTraceOptions', () => {
    test("Should reset trace options to defaults.", () => {
        // Arrange - Set to non-default value
        setTraceOptions({ routerHierarchy: true });
        expect(traceOptions.routerHierarchy).toBe(true);

        // Act
        resetTraceOptions();

        // Assert - Should be back to default
        expect(traceOptions.routerHierarchy).toBe(false);
    });

    test("Should reset trace options when already at defaults.", () => {
        // Arrange - Ensure it's already at default
        resetTraceOptions();
        expect(traceOptions.routerHierarchy).toBe(false);

        // Act
        resetTraceOptions();

        // Assert - Should still be at default
        expect(traceOptions.routerHierarchy).toBe(false);
    });
});

describe('registerRouter', () => {
    let cleanup: () => void;
    beforeAll(() => {
        cleanup = init({ trace: { routerHierarchy: true } });
    });
    afterAll(() => {
        cleanup();
    });
    beforeEach(() => {
        vi.resetAllMocks();
    });
    test("Should be called when a new router engine is created.", () => {
        // Act.
        new RouterEngine();

        // Assert.
        expect(registerRouter).toHaveBeenCalled();
    });
});

describe('getAllChildRouters', () => {
    let cleanup: () => void;
    beforeAll(() => {
        cleanup = init({ trace: { routerHierarchy: true } });
    });
    afterAll(() => {
        cleanup();
    });
    beforeEach(() => {
        vi.clearAllMocks();
    });
    test("Should return the children of the specified router.", () => {
        // Arrange.
        const parent = new RouterEngine();
        const child = new RouterEngine(parent);

        // Act.
        const children = getAllChildRouters(parent);

        // Assert.
        expect(children.length).toBe(1);
        expect(children[0].deref()).toBe(child);
    });
});
