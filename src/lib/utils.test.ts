import { afterEach, describe, expect, test, vi } from "vitest";
import { assertAllowedRoutingMode } from "./utils.js";
import { ALL_HASHES } from "../testing/test-utils.js";
import { resetRoutingOptions, setRoutingOptions } from "./kernel/options.js";
import type { ExtendedRoutingOptions, Hash } from "./types.js";

const hashValues = Object.values(ALL_HASHES).filter(x => x !== undefined);

describe("assertAllowedRoutingMode", () => {
    afterEach(() => {
        resetRoutingOptions();
    });

    test.each(hashValues)
        ("Should not throw when all routing modes are allowed (hash=%s).", (hash) => {
            expect(() => assertAllowedRoutingMode(hash)).not.toThrow();
        });

    test.each<{
        options: Partial<ExtendedRoutingOptions>;
        hash: Hash;
    }>([
        {
            options: {
                disallowHashRouting: true,
            },
            hash: ALL_HASHES.single,
        },
        {
            options: {
                disallowMultiHashRouting: true,
            },
            hash: ALL_HASHES.multi,
        },
        {
            options: {
                disallowPathRouting: true,
            },
            hash: ALL_HASHES.path,
        },
    ])("Should throw when the specified routing mode is disallowed (hash=$hash).", ({ options, hash }) => {
        setRoutingOptions(options);
        expect(() => assertAllowedRoutingMode(hash)).toThrow();
    });
});
