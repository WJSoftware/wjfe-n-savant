import { describe, expect, test } from "vitest";
import { resetRoutingOptions, routingOptions } from "./options.js";

describe("options", () => {
    test("The routing options' initial values are the expected ones.", () => {
        // Assert.
        expect(routingOptions).toEqual({ hashMode: 'single', implicitMode: 'path' });
    });

    test("Should have correct default value for hashMode option.", () => {
        expect(routingOptions.hashMode).toBe('single');
    });

    test("Should have correct default value for implicitMode option.", () => {
        expect(routingOptions.implicitMode).toBe('path');
    });

    test("Should allow modification of hashMode option.", () => {
        const originalValue = routingOptions.hashMode;
        routingOptions.hashMode = 'multi';
        expect(routingOptions.hashMode).toBe('multi');

        // Restore original value
        routingOptions.hashMode = originalValue;
    });

    test("Should allow modification of implicitMode option.", () => {
        const originalValue = routingOptions.implicitMode;
        routingOptions.implicitMode = 'hash';
        expect(routingOptions.implicitMode).toBe('hash');

        // Restore original value
        routingOptions.implicitMode = originalValue;
    });

    test("Should contain all required properties as non-nullable.", () => {
        expect(routingOptions.hashMode).toBeDefined();
        expect(routingOptions.implicitMode).toBeDefined();
        expect(typeof routingOptions.hashMode).toBe('string');
        expect(typeof routingOptions.implicitMode).toBe('string');
    });

    describe('resetRoutingOptions', () => {
        test("Should reset all options to defaults when resetRoutingOptions is called.", () => {
            // Arrange.
            const original = structuredClone(routingOptions);
            routingOptions.hashMode = 'multi';
            routingOptions.implicitMode = 'hash';

            // Act.
            resetRoutingOptions();

            // Assert.
            expect(routingOptions).deep.equal(original);
        });
    });
});
