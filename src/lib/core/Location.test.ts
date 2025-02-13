import { location, setLocation } from "$lib/core/Location.js";
import { describe, test, expect, afterEach } from "vitest";
import { LocationLite } from "./LocationLite.svelte.js";

describe("Location", () => {
    afterEach(() => {
        location?.dispose();
        setLocation(null);
    });
    test("Should be initially undefined.", () => {
        // Assert.
        expect(location).toBeUndefined
    });
    test("Should reflect the updated value after being assigned.", () => {
        // Act.
        setLocation(new LocationLite());

        // Assert.
        expect(location).toBeDefined();
    });
});

describe('setLocation', () => {
    afterEach(() => {
        location?.dispose();
        setLocation(null);
    });
    test("Should throw an error when trying to override the current location object.", () => {
        // Arrange.
        setLocation(new LocationLite());
        const secondLoc = new LocationLite();

        // Act.
        const act = () => setLocation(secondLoc);

        // Assert.
        expect(act).toThrowError();

        // Cleanup.
        secondLoc.dispose();
    });
});