import { describe, expect, test } from "vitest";
import { routingOptions } from "./options.js";

describe("options", () => {
    test("The routing options' initial values are the expected ones.", () => {
        // Assert.
        expect(routingOptions).toEqual({ full: false, hashMode: 'single', implicitMode: 'path' });
    });
});
