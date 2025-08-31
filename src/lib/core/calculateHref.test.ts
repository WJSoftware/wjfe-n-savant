import { describe, test, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { calculateHref, type CalculateHrefOptions } from "./calculateHref.js";
import { init, location } from "$lib/index.js";

describe("calculateHref", () => {
    describe("(...paths) Overload", () => {
        let cleanup: Function;
        beforeAll(() => {
            cleanup = init();
        });
        afterAll(() => {
            cleanup();
        });
        test.each([
            {
                inputPaths: ["path", "anotherPath"],
                expectedHref: "path/anotherPath",
            },
            {
                inputPaths: ["path?a=b", "anotherPath?c=d"],
                expectedHref: "path/anotherPath?a=b&c=d",
            },
            {
                inputPaths: ["path#hash", "anotherPath#hash2"],
                expectedHref: "path/anotherPath#hash",
            }
        ])("Should combine paths $inputPaths as $expectedHref .", ({ inputPaths, expectedHref }) => {
            // Act.
            const href = calculateHref(...inputPaths);

            // Assert.
            expect(href).toBe(expectedHref);
        });
    });
    describe("(options, ...paths) Overload", () => {
        let cleanup: Function;
        beforeAll(() => {
            cleanup = init();
        });
        afterAll(() => {
            cleanup();
        });
        const basePath = "/base/path";
        const baseHash = "#base/hash";
        beforeEach(() => {
            location.url.href = `https://example.com${basePath}${baseHash}`;
        });
        test.each<{
            opts: CalculateHrefOptions;
            url: string;
            expectedHref: string;
            text: string;
            textMode: string;
        }>([
            {
                opts: { hash: false, preserveHash: false },
                url: '/sample/path',
                expectedHref: '/sample/path',
                text: "not preserve hash",
                textMode: "path routing",
            },
            {
                opts: { hash: false, preserveHash: true },
                url: '/sample/path',
                expectedHref: `/sample/path${baseHash}`,
                text: "preserve hash",
                textMode: "path routing",
            },
            {
                opts: { hash: true },
                url: '/sample/path',
                expectedHref: '#/sample/path',
                text: "ignore hash",
                textMode: "hash routing",
            },
        ])("Should $text from the URL for $textMode .", ({ opts, url, expectedHref }) => {
            // Arrange.

            // Act.
            const href = calculateHref(opts, url);

            // Assert.
            expect(href).toBe(expectedHref);
        });
        test("Should create a hash HREF when the 'hash' property is set to true.", () => {
            // Arrange.
            const newPath = "/sample/path";
            const hash = true;

            // Act.
            const href = calculateHref({ hash }, newPath);

            // Assert.
            expect(href).toBe(`#${newPath}`);
        });
        test.each([
            {
                hash: false,
                preserveQuery: true,
                text: 'preserve',
                textMode: 'path routing',
            },
            {
                hash: false,
                preserveQuery: false,
                text: 'not preserve',
                textMode: 'path routing',
            },
            {
                hash: true,
                preserveQuery: true,
                text: 'preserve',
                textMode: 'hash routing',
            },
            {
                hash: true,
                preserveQuery: false,
                text: 'not preserve',
                textMode: 'hash routing',
            },
        ])("Should $text the query string when 'preserveQuery' is $preserveQuery under the $textMode mode.", ({ hash, preserveQuery }) => {
            // Arrange.
            const newPath = "/sample/path";
            const query = "a=b&c=d";
            location.url.search = query;
            const expected = hash ?
                (preserveQuery ? `?${query}#${newPath}` : `#${newPath}`) :
                (preserveQuery ? `${newPath}?${query}` : newPath);

            // Act.
            const href = calculateHref({ hash, preserveQuery }, newPath);

            // Assert.
            expect(href).toBe(expected);
        });
    });
    describe("(options, ...paths) Overload - Multi Hash Routing", () => {
        let cleanup: Function;
        beforeAll(() => {
            cleanup = init({ hashMode: 'multi' });
        });
        afterAll(() => {
            cleanup();
        });
        const basePath = "/base/path";
        const baseHash = "#p1=path/one;p2=path/two";
        beforeEach(() => {
            location.url.href = `https://example.com${basePath}${baseHash}`;
        });
        test("Should preserve all existing paths in the URL's hash when adding a new path.", () => {
            // Arrange.
            const newPath = "/sample/path";
            const hash = 'new';

            // Act.
            const href = calculateHref({ hash }, newPath);

            // Assert.
            expect(href).toBe(`${baseHash};${hash}=${newPath}`);
        });
        test("Should preserve all existing paths in the URL's hash when updating an existing path.", () => {
            // Arrange.
            const newPath = "/sample/path";
            const hash = 'p1';
            const expected = baseHash.replace(/(p1=).+;/i, `$1${newPath};`);

            // Act.
            const href = calculateHref({ hash }, newPath);

            // Assert.
            expect(href).toEqual(expected);
        });
    });
});
