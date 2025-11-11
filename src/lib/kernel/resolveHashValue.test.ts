import { describe, test, expect, beforeEach } from 'vitest';
import { routingOptions } from './options.js';
import { resolveHashValue } from './resolveHashValue.js';
import type { Hash } from '$lib/types.js';

describe("resolveHashValue", () => {
    beforeEach(() => {
        // Reset routingOptions to default before each test
        routingOptions.defaultHash = false;
    });

    test("Should return the defaultHash routing option when hash is undefined.", () => {
        // Arrange
        const newDefaultHash = 'abc';
        routingOptions.defaultHash = newDefaultHash;

        // Act
        const result = resolveHashValue(undefined);

        // Assert
        expect(result).toBe(newDefaultHash);
    });
    test.each<Hash>([
        'p1',
        false,
        true
    ])("Should return the provided hash %s value when defined.", (hash) => {
        // Arrange
        routingOptions.defaultHash = !hash;

        // Act
        const result = resolveHashValue(hash);

        // Assert
        expect(result).toBe(hash);
    });
});
