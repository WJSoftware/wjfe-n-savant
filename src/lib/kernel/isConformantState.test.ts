import { describe, expect, test } from "vitest";
import { isConformantState } from "./isConformantState.js";

describe("isConformantState", () => {
    describe("Valid State objects", () => {
        test("Should return true for minimal valid state with empty hash object.", () => {
            const state = { hash: {} };
            expect(isConformantState(state)).toBe(true);
        });

        test("Should return true for valid state with hash containing string values.", () => {
            const state = { hash: { path: "/home", id: "main" } };
            expect(isConformantState(state)).toBe(true);
        });

        test("Should return true for valid state with hash containing mixed value types.", () => {
            const state = { 
                hash: { 
                    path: "/home", 
                    count: 42, 
                    active: true,
                    data: { nested: "value" }
                } 
            };
            expect(isConformantState(state)).toBe(true);
        });

        test("Should return true for valid state with additional properties beyond hash.", () => {
            const state = { 
                hash: { path: "/home" },
                extraData: "allowed",
                metadata: { timestamp: Date.now() }
            };
            expect(isConformantState(state)).toBe(true);
        });

        test("Should return true for valid state with nested hash object.", () => {
            const state = { 
                hash: { 
                    main: "/home",
                    sidebar: "/menu",
                    modal: null,
                    nested: { deep: { value: "test" } }
                } 
            };
            expect(isConformantState(state)).toBe(true);
        });
    });

    describe("Invalid State objects", () => {
        test("Should return false for null.", () => {
            expect(isConformantState(null)).toBe(false);
        });

        test("Should return false for undefined.", () => {
            expect(isConformantState(undefined)).toBe(false);
        });

        test("Should return false for primitive string.", () => {
            expect(isConformantState("not an object")).toBe(false);
        });

        test("Should return false for primitive number.", () => {
            expect(isConformantState(42)).toBe(false);
        });

        test("Should return false for primitive boolean.", () => {
            expect(isConformantState(true)).toBe(false);
        });

        test("Should return false for array.", () => {
            expect(isConformantState([1, 2, 3])).toBe(false);
        });

        test("Should return false for object without hash property.", () => {
            const state = { data: "value", path: "/home" };
            expect(isConformantState(state)).toBe(false);
        });

        test("Should return false for object with null hash.", () => {
            const state = { hash: null };
            expect(isConformantState(state)).toBe(false);
        });

        test("Should return false for object with undefined hash.", () => {
            const state = { hash: undefined };
            expect(isConformantState(state)).toBe(false);
        });

        test("Should return false for object with string hash.", () => {
            const state = { hash: "string-value" };
            expect(isConformantState(state)).toBe(false);
        });

        test("Should return false for object with number hash.", () => {
            const state = { hash: 42 };
            expect(isConformantState(state)).toBe(false);
        });

        test("Should return false for object with boolean hash.", () => {
            const state = { hash: true };
            expect(isConformantState(state)).toBe(false);
        });

        test("Should return false for object with function hash.", () => {
            const state = { hash: () => {} };
            expect(isConformantState(state)).toBe(false);
        });

        test("Should return false for object with array hash.", () => {
            const state = { hash: ["path1", "path2"] };
            expect(isConformantState(state)).toBe(false);
        });
    });

    describe("Edge cases", () => {
        test("Should return true for empty object with empty hash.", () => {
            const state = { hash: {} };
            expect(isConformantState(state)).toBe(true);
        });

        test("Should return true for state with Date object in hash.", () => {
            const state = { hash: { timestamp: new Date() } };
            expect(isConformantState(state)).toBe(true);
        });

        test("Should return true for state with RegExp object in hash.", () => {
            const state = { hash: { pattern: /test/ } };
            expect(isConformantState(state)).toBe(true);
        });

        test("Should return true for state with Error object in hash.", () => {
            const state = { hash: { error: new Error("test") } };
            expect(isConformantState(state)).toBe(true);
        });

        test("Should return false for object with Symbol as hash property key.", () => {
            const symbolKey = Symbol('hash');
            const state = { [symbolKey]: {} };
            expect(isConformantState(state)).toBe(false);
        });

        test("Should handle circular references in hash object.", () => {
            const state: any = { hash: {} };
            state.hash.circular = state.hash;
            expect(isConformantState(state)).toBe(true);
        });
    });

    describe("Type guard behavior", () => {
        test("Should work as type guard for TypeScript type narrowing.", () => {
            const unknownValue: unknown = { hash: { path: "/test" } };
            
            if (isConformantState(unknownValue)) {
                // TypeScript should recognize this as State type
                expect(unknownValue.hash).toBeDefined();
                expect(typeof unknownValue.hash).toBe('object');
            } else {
                throw new Error("Should have passed type guard");
            }
        });

        test("Should correctly reject invalid state in type guard context.", () => {
            const unknownValue: unknown = { data: "not a state" };
            
            if (isConformantState(unknownValue)) {
                throw new Error("Should not have passed type guard");
            } else {
                // This path should be taken
                expect(unknownValue).toBeDefined();
            }
        });
    });
});
