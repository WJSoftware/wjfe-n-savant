import { describe, expect, test } from "vitest";
import { resetRoutingOptions, routingOptions } from "./options.js";

describe("options", () => {
    test("Should have correct default value for hashMode option.", () => {
        expect(routingOptions.hashMode).toBe('single');
    });

    test("Should have correct default value for defaultHash option.", () => {
        expect(routingOptions.defaultHash).toBe(false);
    });

    test("Should have correct default value for disallowPathRouting option.", () => {
        expect(routingOptions.disallowPathRouting).toBe(false);
    });

    test("Should have correct default value for disallowHashRouting option.", () => {
        expect(routingOptions.disallowHashRouting).toBe(false);
    });

    test("Should have correct default value for disallowMultiHashRouting option.", () => {
        expect(routingOptions.disallowMultiHashRouting).toBe(false);
    });

    test("Should allow modification of hashMode option.", () => {
        const originalValue = routingOptions.hashMode;
        routingOptions.hashMode = 'multi';
        expect(routingOptions.hashMode).toBe('multi');

        // Restore original value
        routingOptions.hashMode = originalValue;
    });

    test("Should allow modification of defaultHash option.", () => {
        const originalValue = routingOptions.defaultHash;
        routingOptions.defaultHash = true;
        expect(routingOptions.defaultHash).toBe(true);

        // Restore original value
        routingOptions.defaultHash = originalValue;
    });

    test("Should contain all required properties as non-nullable.", () => {
        expect(routingOptions.hashMode).toBeDefined();
        expect(routingOptions.defaultHash).toBeDefined();
        expect(typeof routingOptions.hashMode).toBe('string');
        expect(typeof routingOptions.defaultHash).toBe('boolean');
    });

    describe('resetRoutingOptions', () => {
        test("Should reset all options to defaults when resetRoutingOptions is called.", () => {
            // Arrange.
            const original = structuredClone(routingOptions);
            routingOptions.hashMode = 'multi';
            routingOptions.defaultHash = true;
            routingOptions.disallowPathRouting = true;
            routingOptions.disallowHashRouting = true;
            routingOptions.disallowMultiHashRouting = true;

            // Act.
            resetRoutingOptions();

            // Assert.
            expect(routingOptions).deep.equal(original);
        });
    });
});
