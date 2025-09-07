import { describe, expect, test } from "vitest";
import { resetRoutingOptions, routingOptions } from "./options.js";

describe("options", () => {
    test("The routing options' initial values are the expected ones.", () => {
        // Assert.
        expect(routingOptions).toEqual({ full: false, hashMode: 'single', implicitMode: 'path' });
    });

    test("Should have correct default value for full option.", () => {
        expect(routingOptions.full).toBe(false);
    });

    test("Should have correct default value for hashMode option.", () => {
        expect(routingOptions.hashMode).toBe('single');
    });

    test("Should have correct default value for implicitMode option.", () => {
        expect(routingOptions.implicitMode).toBe('path');
    });

    test("Should allow modification of full option.", () => {
        const originalValue = routingOptions.full;
        routingOptions.full = true;
        expect(routingOptions.full).toBe(true);
        
        // Restore original value
        routingOptions.full = originalValue;
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

    test("Should maintain object reference integrity after modifications.", () => {
        const optionsRef = routingOptions;
        routingOptions.full = !routingOptions.full;
        
        expect(optionsRef).toBe(routingOptions);
        expect(optionsRef.full).toBe(routingOptions.full);
        
        // Restore original value
        routingOptions.full = false;
    });

    test("Should contain all required properties as non-nullable.", () => {
        expect(routingOptions.full).toBeDefined();
        expect(routingOptions.hashMode).toBeDefined();
        expect(routingOptions.implicitMode).toBeDefined();
        
        expect(typeof routingOptions.full).toBe('boolean');
        expect(typeof routingOptions.hashMode).toBe('string');
        expect(typeof routingOptions.implicitMode).toBe('string');
    });

    test("Should validate hashMode enum values.", () => {
        const originalValue = routingOptions.hashMode;
        
        // Valid values
        routingOptions.hashMode = 'single';
        expect(routingOptions.hashMode).toBe('single');
        
        routingOptions.hashMode = 'multi';
        expect(routingOptions.hashMode).toBe('multi');
        
        // Restore original value
        routingOptions.hashMode = originalValue;
    });

    test("Should validate implicitMode enum values.", () => {
        const originalValue = routingOptions.implicitMode;
        
        // Valid values
        routingOptions.implicitMode = 'hash';
        expect(routingOptions.implicitMode).toBe('hash');
        
        routingOptions.implicitMode = 'path';
        expect(routingOptions.implicitMode).toBe('path');
        
        // Restore original value
        routingOptions.implicitMode = originalValue;
    });

    test("Should reset all options to defaults when resetRoutingOptions is called.", () => {
        // Arrange - Modify all options to non-default values
        routingOptions.full = true;
        routingOptions.hashMode = 'multi';
        routingOptions.implicitMode = 'hash';

        // Verify they were changed
        expect(routingOptions.full).toBe(true);
        expect(routingOptions.hashMode).toBe('multi');
        expect(routingOptions.implicitMode).toBe('hash');

        // Act
        resetRoutingOptions();

        // Assert - Verify all options are back to defaults
        expect(routingOptions.full).toBe(false);
        expect(routingOptions.hashMode).toBe('single');
        expect(routingOptions.implicitMode).toBe('path');
    });
});
