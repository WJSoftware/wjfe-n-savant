import { describe, test, expect, afterEach } from "vitest";
import { init, initFull } from "./init.js";
import { logger } from "./core/Logger.js";
import { routingOptions } from "./core/options.js";
import { traceOptions } from "./core/trace.svelte.js";
import { location } from "$lib/core/Location.js";
import { LocationLite } from "./core/LocationLite.svelte.js";
import { LocationFull } from "./core/LocationFull.js";

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
        test("Should initialize with console logger when logger option is true (default).", async () => {
            // Act.
            cleanup = fnInfo.fn();

            // Assert.
            expect(logger).toBe(globalThis.console);
        });
        test("Should initialize with custom options and rollback properly.", async () => {
            // Arrange.
            const customLogger = {
                debug: () => { },
                log: () => { },
                warn: () => { },
                error: () => { }
            };

            // Capture initial state
            const initialLoggerIsOffLogger = logger !== globalThis.console;
            const initialRoutingOptions = {
                hashMode: routingOptions.hashMode,
                implicitMode: routingOptions.implicitMode
            };
            const initialTraceOptions = {
                routerHierarchy: traceOptions.routerHierarchy
            };

            // Act - Initialize with custom options
            cleanup = fnInfo.fn({
                hashMode: 'multi',
                implicitMode: 'hash',
                logger: customLogger,
                trace: {
                    routerHierarchy: true
                }
            });

            // Assert - Check that options were applied
            expect(logger).toBe(customLogger);
            expect(routingOptions.hashMode).toBe('multi');
            expect(routingOptions.implicitMode).toBe('hash');
            expect(traceOptions.routerHierarchy).toBe(true);
            expect(location).toBeDefined();

            // Act - Cleanup
            cleanup();
            cleanup = undefined;

            // Assert - Check that everything was rolled back
            expect(logger !== globalThis.console).toBe(initialLoggerIsOffLogger); // Back to offLogger
            expect(routingOptions.hashMode).toBe(initialRoutingOptions.hashMode);
            expect(routingOptions.implicitMode).toBe(initialRoutingOptions.implicitMode);
            expect(traceOptions.routerHierarchy).toBe(initialTraceOptions.routerHierarchy);
            expect(location).toBeNull();
        });
        test("Should rollback routing options to defaults.", async () => {
            // Arrange.
            cleanup = fnInfo.fn({
                hashMode: 'multi',
                implicitMode: 'hash'
            });

            // Verify options were applied
            expect(routingOptions.hashMode).toBe('multi');
            expect(routingOptions.implicitMode).toBe('hash');

            // Act - Cleanup
            cleanup();
            cleanup = undefined;

            // Assert - Check that routing options were reset to defaults
            expect(routingOptions.hashMode).toBe('single');
            expect(routingOptions.implicitMode).toBe('path');
        });
        describe('cleanup', () => {
            test("Should rollback logger to its uninitialized value.", async () => {
                // Arrange.
                const uninitializedLogger = logger;
                cleanup = fnInfo.fn({
                    logger: { debug: () => { }, log: () => { }, warn: () => { }, error: () => { } }
                });
                expect(logger).not.toBe(uninitializedLogger);

                // Act.
                cleanup();
                cleanup = undefined;

                // Assert.
                expect(logger).toBe(uninitializedLogger);
            });
            test("Should rollback trace options to defaults.", async () => {
                // Arrange.
                cleanup = fnInfo.fn({
                    trace: {
                        routerHierarchy: true
                    }
                });
                expect(traceOptions.routerHierarchy).toBe(true);

                // Act.
                cleanup();
                cleanup = undefined;

                // Assert.
                expect(traceOptions.routerHierarchy).toBe(false);
            });
            test("Should handle multiple init/cleanup cycles properly.", async () => {
                // Arrange.
                const uninitializedLogger = logger;
                cleanup = fnInfo.fn({
                    logger: { debug: () => { }, log: () => { }, warn: () => { }, error: () => { } }
                });
                expect(logger).not.toBe(uninitializedLogger);
                expect(location).toBeDefined();
                cleanup();
                cleanup = undefined;
                expect(logger).toBe(uninitializedLogger);
                expect(location).toBeNull();
                cleanup = fnInfo.fn({ hashMode: 'multi' });
                expect(routingOptions.hashMode).toBe('multi');
                expect(location).toBeDefined();

                // Act.
                cleanup();
                cleanup = undefined;

                // Assert.
                expect(routingOptions.hashMode).toBe('single');
                expect(location).toBeNull();
            });
        });
    });
});
