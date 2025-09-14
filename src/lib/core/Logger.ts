import type { ILogger } from "../types.js";

const stockLogger: ILogger = globalThis.console;

const noop = () => { };

const offLogger: ILogger = {
    debug: noop,
    log: noop,
    warn: noop,
    error: noop
};

export let logger: ILogger = offLogger;

export function setLogger(newLogger: boolean | ILogger) {
    logger = newLogger === true ? stockLogger : (newLogger === false ? offLogger : newLogger);
}

/**
 * Resets the logger to the default uninitialized state (offLogger).
 */
export function resetLogger(): void {
    logger = offLogger;
}
