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
});
