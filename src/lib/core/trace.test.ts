import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { getAllChildRouters, setTraceOptions, traceOptions } from "./trace.svelte.js";
import { RouterEngine } from "./RouterEngine.svelte.js";
import { init } from "$lib/index.js";

const hoistedVars = vi.hoisted(() => ({
    registerRouter: vi.fn(),
}));
vi.mock('./trace.svelte.js', async (originalImport) => {
    const origModule = await originalImport() as any;
    return {
        ...origModule,
        registerRouter: (...args: any[]) => {
            hoistedVars.registerRouter.apply(null, args);
            return origModule.registerRouter.apply(null, args);
        }
    }
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

describe('registerRouter', () => {
    let cleanup: () => void;
    beforeAll(() => {
        cleanup = init({ trace: { routerHierarchy: true } });
    });
    afterAll(() => {
        cleanup();
    });
    beforeEach(() => {
        hoistedVars.registerRouter.mockClear();
    });
    test("Should be called when a new router engine is created.", () => {
        // Act.
        new RouterEngine();

        // Assert.
        expect(hoistedVars.registerRouter).toHaveBeenCalled();
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
        hoistedVars.registerRouter.mockClear();
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
