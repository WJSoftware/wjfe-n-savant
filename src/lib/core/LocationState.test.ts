import { describe, test, expect } from "vitest";
import { LocationState } from "./LocationState.svelte.js";

describe('LocationState', () => {
    describe('constructor', () => {
        test("Should create a new instance with the expected default values.", () => {
            // Act.
            const ls = new LocationState();

            // Assert.
            expect(ls.state).toEqual({ hash: {} });
        });
    });
});
