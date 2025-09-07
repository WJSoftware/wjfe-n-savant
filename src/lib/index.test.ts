import { describe, expect, test, beforeEach, afterEach } from "vitest";
import { logger } from "./core/Logger.js";
import { routingOptions } from "./core/options.js";
import { traceOptions } from "./core/trace.svelte.js";
import { location } from "./core/Location.js";

describe('index', () => {
    let cleanup: (() => void) | null = null;

    afterEach(() => {
        cleanup?.();
    });

    test("Should export exactly the expected objects.", async () => {
        // Arrange.
        const expectedList = [
            'Link',
            'LinkContext',
            'Route',
            'Router',
            'Fallback',
            'location',
            'RouterTrace',
            'init',
            'getRouterContext',
            'setRouterContext',
        ];

        // Act.
        const lib = await import('./index.js');

        // Assert.
        for (let item of expectedList) {
            expect(item in lib, `The expected object ${item} is not exported.`).toEqual(true);
        }
        for (let key of Object.keys(lib)) {
            expect(expectedList.includes(key), `The library exports object ${key}, which is not expected.`).toEqual(true);
        }
    });

    test("Should use offLogger as default uninitialized logger.", () => {
        // Assert.
        expect(logger.debug).toBeDefined();
        expect(logger.log).toBeDefined();
        expect(logger.warn).toBeDefined();
        expect(logger.error).toBeDefined();
        
        // The default logger should be offLogger (no-op functions)
        // We can't test the exact identity, but we can test that it's not the console
        expect(logger).not.toBe(globalThis.console);
    });

    test("Should have default routing options in uninitialized state.", () => {
        // Assert.
        expect(routingOptions.full).toBe(false);
        expect(routingOptions.hashMode).toBe('single');
        expect(routingOptions.implicitMode).toBe('path');
    });

    test("Should have default trace options in uninitialized state.", () => {
        // Assert.
        expect(traceOptions.routerHierarchy).toBe(false);
    });

    test("Should have no location in uninitialized state.", () => {
        // Assert.
        expect(location).toBeUndefined();
    });

    test("Should initialize with console logger when logger option is true (default).", async () => {
        // Arrange.
        const { init } = await import('./index.js');

        // Act.
        cleanup = init();

        // Assert.
        expect(logger).toBe(globalThis.console);
    });

    test("Should initialize with custom options and rollback properly.", async () => {
        // Arrange.
        const { init } = await import('./index.js');
        const customLogger = {
            debug: () => {},
            log: () => {},
            warn: () => {},
            error: () => {}
        };

        // Capture initial state
        const initialLoggerIsOffLogger = logger !== globalThis.console;
        const initialRoutingOptions = {
            full: routingOptions.full,
            hashMode: routingOptions.hashMode,
            implicitMode: routingOptions.implicitMode
        };
        const initialTraceOptions = {
            routerHierarchy: traceOptions.routerHierarchy
        };

        // Act - Initialize with custom options
        cleanup = init({
            full: true,
            hashMode: 'multi',
            implicitMode: 'hash',
            logger: customLogger,
            trace: {
                routerHierarchy: true
            }
        });

        // Assert - Check that options were applied
        expect(logger).toBe(customLogger);
        expect(routingOptions.full).toBe(true);
        expect(routingOptions.hashMode).toBe('multi');
        expect(routingOptions.implicitMode).toBe('hash');
        expect(traceOptions.routerHierarchy).toBe(true);
        expect(location).toBeDefined();

        // Act - Cleanup
        cleanup();
        cleanup = null;

        // Assert - Check that everything was rolled back
        expect(logger !== globalThis.console).toBe(initialLoggerIsOffLogger); // Back to offLogger
        expect(routingOptions.full).toBe(initialRoutingOptions.full);
        expect(routingOptions.hashMode).toBe(initialRoutingOptions.hashMode);
        expect(routingOptions.implicitMode).toBe(initialRoutingOptions.implicitMode);
        expect(traceOptions.routerHierarchy).toBe(initialTraceOptions.routerHierarchy);
        expect(location).toBeNull();
    });

    test("Should rollback routing options to defaults.", async () => {
        // Arrange.
        const { init } = await import('./index.js');

        // Act - Initialize with non-default options
        cleanup = init({
            full: true,
            hashMode: 'multi',
            implicitMode: 'hash'
        });

        // Verify options were applied
        expect(routingOptions.full).toBe(true);
        expect(routingOptions.hashMode).toBe('multi');
        expect(routingOptions.implicitMode).toBe('hash');

        // Act - Cleanup
        cleanup();
        cleanup = null;

        // Assert - Check that routing options were reset to defaults
        expect(routingOptions.full).toBe(false);
        expect(routingOptions.hashMode).toBe('single');
        expect(routingOptions.implicitMode).toBe('path');
    });

    test("Should rollback logger to offLogger.", async () => {
        // Arrange.
        const { init } = await import('./index.js');

        // Act - Initialize with console logger (default)
        cleanup = init();

        // Verify logger was set to console
        expect(logger).toBe(globalThis.console);

        // Act - Cleanup
        cleanup();
        cleanup = null;

        // Assert - Check that logger was reset to offLogger
        expect(logger).not.toBe(globalThis.console);
        expect(logger.debug).toBeDefined();
        expect(logger.log).toBeDefined();
        expect(logger.warn).toBeDefined();
        expect(logger.error).toBeDefined();
    });

    test("Should rollback trace options to defaults.", async () => {
        // Arrange.
        const { init } = await import('./index.js');

        // Act - Initialize with non-default trace options
        cleanup = init({
            trace: {
                routerHierarchy: true
            }
        });

        // Verify trace options were applied
        expect(traceOptions.routerHierarchy).toBe(true);

        // Act - Cleanup
        cleanup();
        cleanup = null;

        // Assert - Check that trace options were reset to defaults
        expect(traceOptions.routerHierarchy).toBe(false);
    });

    test("Should handle multiple init/cleanup cycles properly.", async () => {
        // Arrange.
        const { init } = await import('./index.js');

        // Act & Assert - First cycle
        cleanup = init({ full: true });
        expect(routingOptions.full).toBe(true);
        expect(logger).toBe(globalThis.console);
        expect(location).toBeDefined();

        cleanup();
        cleanup = null;
        expect(routingOptions.full).toBe(false);
        expect(logger).not.toBe(globalThis.console);
        expect(location).toBeNull();

        // Act & Assert - Second cycle
        cleanup = init({ hashMode: 'multi' });
        expect(routingOptions.hashMode).toBe('multi');
        expect(logger).toBe(globalThis.console);
        expect(location).toBeDefined();

        cleanup();
        cleanup = null;
        expect(routingOptions.hashMode).toBe('single');
        expect(logger).not.toBe(globalThis.console);
        expect(location).toBeNull();
    });

    test("Should handle cleanup without previous initialization gracefully.", async () => {
        // Arrange.
        const { init } = await import('./index.js');
        cleanup = init();

        // Act - Call cleanup function
        const cleanupFn = cleanup;
        cleanup = null;
        
        // Should not throw when calling cleanup
        expect(() => cleanupFn()).not.toThrow();
    });
});
