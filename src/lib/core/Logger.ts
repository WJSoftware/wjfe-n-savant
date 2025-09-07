import type { ILogger } from "$lib/types.js";

const stockLogger: ILogger = globalThis.console;

const noop = () => { };

const offLogger: ILogger = {
    debug: noop,
    log: noop,
    warn: noop,
    error: noop
};

export let logger: ILogger = stockLogger;

export function setLogger(newLogger: boolean | ILogger) {
    logger = newLogger === true ? stockLogger : (newLogger === false ? offLogger : newLogger);
};
