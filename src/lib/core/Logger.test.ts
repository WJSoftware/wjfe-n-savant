import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { logger, resetLogger, setLogger } from "./Logger.js";
import type { ILogger } from "$lib/types.js";

describe("logger", () => {
    test("Should default to offLogger (not console)", () => {
        expect(logger).not.toBe(globalThis.console);
        expect(logger.debug).toBeDefined();
        expect(logger.log).toBeDefined();
        expect(logger.warn).toBeDefined();
        expect(logger.error).toBeDefined();
    });
});

describe("setLogger", () => {
    let originalLogger: ILogger;
    let mockLogger: ILogger;
    let consoleSpy: {
        debug: any;
        log: any;
        warn: any;
        error: any;
    };

    beforeEach(() => {
        // Store original logger state
        originalLogger = logger;
        
        // Create mock logger
        mockLogger = {
            debug: vi.fn(),
            log: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        };

        // Create console spies
        consoleSpy = {
            debug: vi.spyOn(globalThis.console, 'debug').mockImplementation(() => {}),
            log: vi.spyOn(globalThis.console, 'log').mockImplementation(() => {}),
            warn: vi.spyOn(globalThis.console, 'warn').mockImplementation(() => {}),
            error: vi.spyOn(globalThis.console, 'error').mockImplementation(() => {})
        };
    });

    afterEach(() => {
        // Restore original state
        setLogger(originalLogger);
        vi.restoreAllMocks();
    });

    describe("Boolean arguments", () => {
        test("Should set logger to globalThis.console when true", () => {
            setLogger(true);
            
            expect(logger).toBe(globalThis.console);
            
            logger.debug("test");
            expect(consoleSpy.debug).toHaveBeenCalledWith("test");
        });

        test("Should set logger to noop functions when false", () => {
            setLogger(false);
            
            expect(logger).not.toBe(globalThis.console);
            
            // Should not throw and should not call console
            logger.debug("debug message");
            logger.log("log message");
            logger.warn("warn message");
            logger.error("error message");

            expect(consoleSpy.debug).not.toHaveBeenCalled();
            expect(consoleSpy.log).not.toHaveBeenCalled();
            expect(consoleSpy.warn).not.toHaveBeenCalled();
            expect(consoleSpy.error).not.toHaveBeenCalled();
        });

        test("Should allow switching between true and false", () => {
            setLogger(true);
            logger.log("enabled message");
            expect(consoleSpy.log).toHaveBeenCalledWith("enabled message");

            setLogger(false);
            logger.log("disabled message");
            expect(consoleSpy.log).toHaveBeenCalledTimes(1); // Should not be called again

            setLogger(true);
            logger.log("re-enabled message");
            expect(consoleSpy.log).toHaveBeenCalledWith("re-enabled message");
            expect(consoleSpy.log).toHaveBeenCalledTimes(2);
        });
    });

    describe("ILogger implementations", () => {
        test("Should set custom logger as the global logger", () => {
            setLogger(mockLogger);
            
            expect(logger).toBe(mockLogger);
            
            logger.debug("custom debug");
            logger.log("custom log");
            logger.warn("custom warn");
            logger.error("custom error");

            expect(mockLogger.debug).toHaveBeenCalledWith("custom debug");
            expect(mockLogger.log).toHaveBeenCalledWith("custom log");
            expect(mockLogger.warn).toHaveBeenCalledWith("custom warn");
            expect(mockLogger.error).toHaveBeenCalledWith("custom error");
            
            // Console should not be called
            expect(consoleSpy.debug).not.toHaveBeenCalled();
            expect(consoleSpy.log).not.toHaveBeenCalled();
            expect(consoleSpy.warn).not.toHaveBeenCalled();
            expect(consoleSpy.error).not.toHaveBeenCalled();
        });

        test("Should work with extended logger implementations", () => {
            const extendedLogger = {
                ...mockLogger,
                trace: vi.fn(),
                info: vi.fn()
            };

            setLogger(extendedLogger);
            
            expect(logger).toBe(extendedLogger);
            
            logger.debug("debug");
            logger.log("log");
            logger.warn("warn");
            logger.error("error");

            expect(extendedLogger.debug).toHaveBeenCalledWith("debug");
            expect(extendedLogger.log).toHaveBeenCalledWith("log");
            expect(extendedLogger.warn).toHaveBeenCalledWith("warn");
            expect(extendedLogger.error).toHaveBeenCalledWith("error");
        });

        test("Should allow switching from custom logger back to stock logger", () => {
            setLogger(mockLogger);
            logger.log("custom message");
            expect(mockLogger.log).toHaveBeenCalledWith("custom message");

            setLogger(true);
            logger.log("stock message");
            expect(consoleSpy.log).toHaveBeenCalledWith("stock message");
            expect(mockLogger.log).toHaveBeenCalledTimes(1); // Should not be called again
        });

        test("Should handle multiple parameters correctly", () => {
            setLogger(mockLogger);
            
            logger.debug("debug", 123, { key: "value" });
            logger.log("log", true, null);
            logger.warn("warn", "multiple", "parameters");
            logger.error("error", { error: "object" });

            expect(mockLogger.debug).toHaveBeenCalledWith("debug", 123, { key: "value" });
            expect(mockLogger.log).toHaveBeenCalledWith("log", true, null);
            expect(mockLogger.warn).toHaveBeenCalledWith("warn", "multiple", "parameters");
            expect(mockLogger.error).toHaveBeenCalledWith("error", { error: "object" });
        });
    });

    describe("resetLogger", () => {
        test("Should reset logger to offLogger (default uninitialized state).", () => {
            // Arrange - Set logger to console
            setLogger(true);
            expect(logger).toBe(globalThis.console);

            // Act
            resetLogger();

            // Assert - Logger should be back to offLogger
            expect(logger).not.toBe(globalThis.console);
            expect(logger.debug).toBeDefined();
            expect(logger.log).toBeDefined();
            expect(logger.warn).toBeDefined();
            expect(logger.error).toBeDefined();
        });

        test("Should reset logger from custom logger to offLogger.", () => {
            // Arrange - Set logger to custom logger
            const customLogger = {
                debug: vi.fn(),
                log: vi.fn(),
                warn: vi.fn(),
                error: vi.fn()
            };
            setLogger(customLogger);
            expect(logger).toBe(customLogger);

            // Act
            resetLogger();

            // Assert - Logger should be back to offLogger
            expect(logger).not.toBe(customLogger);
            expect(logger).not.toBe(globalThis.console);
            expect(logger.debug).toBeDefined();
            expect(logger.log).toBeDefined();
            expect(logger.warn).toBeDefined();
            expect(logger.error).toBeDefined();
        });
    });
});
