import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { preserveQueryInUrl, mergeQueryParams } from './preserveQuery.js';
import { init } from '../init.js';
import { location } from './Location.js';

describe('preserveQuery utilities', () => {
    let cleanup: Function;
    beforeAll(() => {
        cleanup = init();
    });
    afterAll(() => {
        cleanup();
    });

    describe('preserveQueryInUrl', () => {
        beforeEach(() => {
            location.url.href = 'https://example.com/base?existing=value&another=param';
        });

        test('Should return URL unchanged when preserveQuery is false', () => {
            const url = 'https://example.com/new';
            const result = preserveQueryInUrl(url, false);
            expect(result).toBe(url);
        });

        test('Should preserve all query parameters when preserveQuery is true', () => {
            const url = 'https://example.com/new?new=param';
            const result = preserveQueryInUrl(url, true);
            expect(result).toBe('https://example.com/new?new=param&existing=value&another=param');
        });

        test('Should preserve specific query parameter when preserveQuery is a string', () => {
            const url = 'https://example.com/new';
            const result = preserveQueryInUrl(url, 'existing');
            expect(result).toBe('https://example.com/new?existing=value');
        });

        test('Should preserve specific query parameters when preserveQuery is an array', () => {
            const url = 'https://example.com/new';
            const result = preserveQueryInUrl(url, ['existing']);
            expect(result).toBe('https://example.com/new?existing=value');
        });

        test('Should handle relative URLs correctly', () => {
            const url = '/new?new=param';
            const result = preserveQueryInUrl(url, 'existing');
            expect(result).toBe('https://example.com/new?new=param&existing=value');
        });
    });

    describe('mergeQueryParams', () => {
        beforeEach(() => {
            location.url.href = 'https://example.com/base?existing=value&another=param';
        });

        test('Should return existing params unchanged when preserveQuery is false', () => {
            const existing = new URLSearchParams('new=param');
            const result = mergeQueryParams(existing, false);
            expect(result).toBe(existing);
        });

        test('Should return current location params when no existing params and preserveQuery is true', () => {
            const result = mergeQueryParams(undefined, true);
            expect(result).toBe(location.url.searchParams);
        });

        test('Should merge params correctly when preserveQuery is true', () => {
            const existing = new URLSearchParams('new=param');
            const result = mergeQueryParams(existing, true);
            expect(result?.get('new')).toBe('param');
            expect(result?.get('existing')).toBe('value');
            expect(result?.get('another')).toBe('param');
        });
    });
});
