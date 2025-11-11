import { afterEach, describe, expect, test, vi } from "vitest";
import { assertAllowedRoutingMode, expandAriaAttributes } from "./utils.js";
import { ALL_HASHES } from "../testing/test-utils.js";
import { resetRoutingOptions, setRoutingOptions } from "./kernel/options.js";
import type { ActiveStateAriaAttributes, ExtendedRoutingOptions, Hash } from "./types.js";
import type { AriaAttributes } from "svelte/elements";

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

describe("expandAriaAttributes", () => {
    test("Should return undefined when input is undefined.", () => {
        // Act.
        const result = expandAriaAttributes(undefined);

        // Assert.
        expect(result).toBeUndefined();
    });
    test.each<{
        input: ActiveStateAriaAttributes;
        expected: AriaAttributes;
    }>([
        {
            input: { current: 'page' },
            expected: { 'aria-current': 'page' },
        },
        {
            input: { disabled: true, hidden: false },
            expected: { 'aria-disabled': true, 'aria-hidden': false },
        },
    ])("Should expand $input as $expected .", ({ input, expected }) => {
        // Act.
        const result = expandAriaAttributes(input);

        // Assert.
        expect(result).toEqual(expected);
    });
});
