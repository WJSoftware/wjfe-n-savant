import { describe, test, expect } from 'vitest';
import { dissectHrefs } from './dissectHrefs.js';

describe('dissectHrefs', () => {
    test.each([
        '',
        null,
        undefined,
        0,
    ])("Should return empty strings for all parts when given falsy href: %s", (href) => {
        // Act.
        // @ts-expect-error ts2345
        const { paths, hashes, searchParams } = dissectHrefs(href);

        // Assert.
        expect(paths).toEqual(['']);
        expect(hashes).toEqual(['']);
        expect(searchParams).toEqual(['']);
    });
    test.each([
        {
            href: 'path',
            expectedPaths: ['path'],
            expectedHashes: [''],
            expectedSearchParams: [''],
        },
        {
            href: 'path#hash',
            expectedPaths: ['path'],
            expectedHashes: ['hash'],
            expectedSearchParams: [''],
        },
        {
            href: 'path?search',
            expectedPaths: ['path'],
            expectedHashes: [''],
            expectedSearchParams: ['search'],
        },
        {
            href: 'path?search#hash',
            expectedPaths: ['path'],
            expectedHashes: ['hash'],
            expectedSearchParams: ['search'],
        },
        {
            href: '?search#hash',
            expectedPaths: [''],
            expectedHashes: ['hash'],
            expectedSearchParams: ['search'],
        },
        {
            href: '#hash',
            expectedPaths: [''],
            expectedHashes: ['hash'],
            expectedSearchParams: [''],
        },
        {
            href: '?search',
            expectedPaths: [''],
            expectedHashes: [''],
            expectedSearchParams: ['search'],
        },
        {
            href: '/',
            expectedPaths: ['/'],
            expectedHashes: [''],
            expectedSearchParams: [''],
        },
    ])("Should appropriately parse href $href .", ({ href, expectedPaths, expectedHashes, expectedSearchParams }) => {
        // Act.
        const { paths, hashes, searchParams } = dissectHrefs(href);

        // Assert.
        expect(paths).toEqual(expectedPaths);
        expect(hashes).toEqual(expectedHashes);
        expect(searchParams).toEqual(expectedSearchParams);
    });
    test("Should strip the pound sign when returning the stripped hash value.", () => {
        // Act.
        const { hashes } = dissectHrefs('path?search#hash');

        // Assert.
        expect(hashes).toEqual(['hash']);
    });
    test("Should strip the question mark when returning the stripped search parameters value.", () => {
        // Act.
        const { searchParams } = dissectHrefs('path?search#hash');

        // Assert.
        expect(searchParams).toEqual(['search']);
    });

    describe("Multiple hrefs processing", () => {
        test("Should process multiple hrefs and maintain correct index correspondence", () => {
            // Act
            const { paths, hashes, searchParams } = dissectHrefs(
                'path1?search1#hash1',
                'path2?search2#hash2',
                'path3?search3#hash3'
            );

            // Assert
            expect(paths).toEqual(['path1', 'path2', 'path3']);
            expect(hashes).toEqual(['hash1', 'hash2', 'hash3']);
            expect(searchParams).toEqual(['search1', 'search2', 'search3']);
        });

        test("Should handle mixed falsy and valid hrefs", () => {
            // Act
            const { paths, hashes, searchParams } = dissectHrefs(
                'valid/path?search#hash',
                undefined,
                '',
                'another/path'
            );

            // Assert
            expect(paths).toEqual(['valid/path', '', '', 'another/path']);
            expect(hashes).toEqual(['hash', '', '', '']);
            expect(searchParams).toEqual(['search', '', '', '']);
        });

        test("Should handle empty array (no hrefs)", () => {
            // Act
            const { paths, hashes, searchParams } = dissectHrefs();

            // Assert
            expect(paths).toEqual([]);
            expect(hashes).toEqual([]);
            expect(searchParams).toEqual([]);
        });
    });

    describe("Complex URL patterns", () => {
        test("Should handle complex search parameters with multiple values", () => {
            // Act
            const { searchParams } = dissectHrefs('path?param1=value1&param2=value2&param3=value3');

            // Assert
            expect(searchParams).toEqual(['param1=value1&param2=value2&param3=value3']);
        });

        test("Should handle complex hash values with special characters", () => {
            // Act
            const { hashes } = dissectHrefs('path#section-1:subsection-2/path');

            // Assert
            expect(hashes).toEqual(['section-1:subsection-2/path']);
        });

        test("Should handle URLs with encoded characters", () => {
            // Act
            const { paths, hashes, searchParams } = dissectHrefs('path%20with%20spaces?search%3Dvalue#hash%20value');

            // Assert
            expect(paths).toEqual(['path%20with%20spaces']);
            expect(searchParams).toEqual(['search%3Dvalue']);
            expect(hashes).toEqual(['hash%20value']);
        });
    });

    describe("Edge cases and malformed inputs", () => {
        test("Should handle multiple question marks (only first one counts)", () => {
            // Act
            const { paths, searchParams } = dissectHrefs('path?search1?search2');

            // Assert
            expect(paths).toEqual(['path']);
            expect(searchParams).toEqual(['search1?search2']);
        });

        test("Should handle multiple hashes (only first one counts)", () => {
            // Act
            const { paths, hashes } = dissectHrefs('path#hash1#hash2');

            // Assert
            expect(paths).toEqual(['path']);
            expect(hashes).toEqual(['hash1#hash2']);
        });

        test("Should handle paths with forward slashes", () => {
            // Act
            const { paths } = dissectHrefs('/root/path/to/resource');

            // Assert
            expect(paths).toEqual(['/root/path/to/resource']);
        });

        test("Should handle empty path with just query and hash", () => {
            // Act
            const { paths, hashes, searchParams } = dissectHrefs('?just-query#just-hash');

            // Assert
            expect(paths).toEqual(['']);
            expect(searchParams).toEqual(['just-query']);
            expect(hashes).toEqual(['just-hash']);
        });
    });
});
