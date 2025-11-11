import { describe, test, expect, afterEach } from "vitest";
import { init, initFull } from "./init.js";
import { location } from "./kernel/Location.js";
import { LocationLite } from "./kernel/LocationLite.svelte.js";
import { LocationFull } from "./kernel/LocationFull.js";

let cleanup: (() => void) | undefined;

[
    {
        fn: init,
        locationClass: LocationLite
    },
    {
        fn: initFull,
        locationClass: LocationFull
    }
].forEach((fnInfo) => {
    describe(fnInfo.fn.name, () => {
        afterEach(() => {
            cleanup?.();
        });

        test(`Should initialize the global location object to an instance of the ${fnInfo.locationClass.name} class.`, () => {
            // Act.
            cleanup = fnInfo.fn();

            // Assert.
            expect(location).toBeDefined();
            expect(location).toBeInstanceOf(fnInfo.locationClass);
        });
    });
});

describe('init + initFull', () => {
    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
    });
    test.each([
        {
            fn1: init,
            fn2: initFull,
        },
        {
            fn1: initFull,
            fn2: init,
        },
    ])("Should throw an error when calling $fn2.name without prior cleaning of a call to $fn1.name .", ({ fn1, fn2 }) => {
        // Arrange.
        cleanup = fn1();

        // Act.
        const act = () => fn2();

        // Assert.
        expect(act).toThrow();
    });
});