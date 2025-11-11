import type { Location } from "../types.js";
import { describe, test, expect, afterEach, vi } from 'vitest';
import { initCore } from './initCore.js';
import { SvelteURL } from "svelte/reactivity";
import { location } from "./Location.js";
import { defaultTraceOptions, traceOptions } from "./trace.svelte.js";
import { defaultRoutingOptions, routingOptions } from "./options.js";
import { logger } from "./Logger.js";

const initialUrl = 'http://example.com/';
const locationMock: Location = {
    url: new SvelteURL(initialUrl),
    hashPaths: {},
    back: vi.fn(),
    dispose: vi.fn(),
    forward: vi.fn(),
    getState: vi.fn(),
    goTo: vi.fn(),
    on: vi.fn(),
    go: vi.fn(),
    navigate: vi.fn(),
};

describe('initCore', () => {
    let cleanup: (() => void) | undefined;
    afterEach(() => {
        vi.resetAllMocks();
        cleanup?.();
    });
    test("Should initialize with all the expected default values.", () => {
        // Act.
        cleanup = initCore(locationMock);

        // Assert.
        expect(location).toBe(locationMock);
        expect(traceOptions).toEqual(defaultTraceOptions);
        expect(routingOptions).toEqual(defaultRoutingOptions);
        expect(logger).toBe(globalThis.console);
    });
    test("Should throw an error when no location object is provided.", () => {
        // Act.
        const act = () => initCore(null as unknown as Location);

        // Assert.
        expect(act).toThrow();
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
            defaultHash: routingOptions.defaultHash
        };
        const initialTraceOptions = {
            routerHierarchy: traceOptions.routerHierarchy
        };

        // Act - Initialize with custom options
        cleanup = initCore(locationMock, {
            hashMode: 'multi',
            defaultHash: true,
            logger: customLogger,
            trace: {
                routerHierarchy: true
            }
        });

        // Assert - Check that options were applied
        expect(logger).toBe(customLogger);
        expect(routingOptions.hashMode).toBe('multi');
        expect(routingOptions.defaultHash).toBe(true);
        expect(traceOptions.routerHierarchy).toBe(true);
        expect(location).toBeDefined();

        // Act - Cleanup
        cleanup();
        cleanup = undefined;

        // Assert - Check that everything was rolled back
        expect(logger !== globalThis.console).toBe(initialLoggerIsOffLogger); // Back to offLogger
        expect(routingOptions.hashMode).toBe(initialRoutingOptions.hashMode);
        expect(routingOptions.defaultHash).toBe(initialRoutingOptions.defaultHash);
        expect(traceOptions.routerHierarchy).toBe(initialTraceOptions.routerHierarchy);
        expect(location).toBeNull();
    });
    test("Should throw an error when called a second time without proper prior cleanup.", () => {
        // Arrange.
        cleanup = initCore(locationMock);

        // Act.
        const act = () => initCore(locationMock);

        // Assert.
        expect(act).toThrow();
    });
    describe('cleanup', () => {
        test("Should rollback everything to defaults.", async () => {
            // Arrange.
            const uninitializedLogger = logger;
            cleanup = initCore(locationMock, {
                hashMode: 'multi',
                defaultHash: true,
                trace: {
                    routerHierarchy: !defaultTraceOptions.routerHierarchy
                }
            });
            // Verify options were applied
            expect(routingOptions.hashMode).toBe('multi');
            expect(routingOptions.defaultHash).toBe(true);
            expect(logger).not.toBe(uninitializedLogger);
            expect(traceOptions.routerHierarchy).toBe(!defaultTraceOptions.routerHierarchy);

            // Act - Cleanup
            cleanup();
            cleanup = undefined;

            // Assert - Check that routing options were reset to defaults
            expect(routingOptions.hashMode).toBe('single');
            expect(routingOptions.defaultHash).toBe(false);
            expect(logger).toBe(uninitializedLogger);
            expect(traceOptions).toEqual(defaultTraceOptions);
        });
        test("Should handle multiple init/cleanup cycles properly.", async () => {
            // Arrange.
            const uninitializedLogger = logger;
            cleanup = initCore(locationMock, {
                logger: { debug: () => { }, log: () => { }, warn: () => { }, error: () => { } }
            });
            expect(logger).not.toBe(uninitializedLogger);
            expect(location).toBeDefined();
            cleanup();
            cleanup = undefined;
            expect(logger).toBe(uninitializedLogger);
            expect(location).toBeNull();
            cleanup = initCore(locationMock, { hashMode: 'multi' });
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
