import { init, location } from '$lib/index.js';
import { describe, test, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { calculateState } from './calculateState.svelte.js';

describe('calculateState', () => {
    const initialUrl = "http://example.com/";
    let cleanup: () => void;
    let _href: string;
    let interceptedState: any;

    beforeAll(() => {
        // Mock window.location and window.history
        // @ts-expect-error Missing window features for testing
        globalThis.window.location = {
            get href() {
                return _href;
            },
            set href(value) {
                _href = value;
            }
        };
        // @ts-expect-error Missing window features for testing
        globalThis.window.history = {
            get state() {
                return interceptedState;
            },
            pushState: vi.fn(),
            replaceState: vi.fn()
        };
        
        // Set initial clean state
        _href = initialUrl;
        interceptedState = { path: undefined, hash: {} };
        
        cleanup = init();
    });
    
    beforeEach(() => {
        // Reset to clean state before each test
        globalThis.window.location.href = initialUrl;
        interceptedState = { path: undefined, hash: {} };
    });
    
    afterAll(() => {
        cleanup?.();
    });
    
    describe('Clean Slate (no existing state)', () => {
        test.each([
            {
                hash: false,
                state: 1,
                expected: { path: 1, hash: {} }
            },
            {
                hash: true,
                state: 2,
                expected: { hash: { single: 2 } }
            },
            {
                hash: 'abc',
                state: 3,
                expected: { hash: { 'abc': 3 } }
            },
        ])("Should set the state object when 'hash' is $hash .", ({ hash, state, expected }) => {
            // Act.
            const newState = calculateState(hash, state);

            // Assert.
            expect(newState).toEqual(expected);
        });
    });

    describe('State Preservation - Traditional Hash Routing', () => {
        beforeEach(() => {
            // Set up initial state with path and single hash state
            location.navigate('/initial-path', { state: { path: 'initial' } });
            location.navigate('/initial-hash', { hash: true, state: { single: 'initial' } });
        });

        test('Path routing should preserve existing single hash state', () => {
            // Act.
            const newState = calculateState(false, { path: 'new' });

            // Assert.
            expect(newState).toEqual({
                path: { path: 'new' },
                hash: { single: { single: 'initial' } }
            });
        });

        test('Single hash routing should preserve existing path state', () => {
            // Act.
            const newState = calculateState(true, { single: 'new' });

            // Assert.
            expect(newState).toEqual({
                path: { path: 'initial' },
                hash: { single: { single: 'new' } }
            });
        });
    });
});

describe('calculateState - Multi Hash Routing', () => {
    const initialUrl = "http://example.com/";
    let cleanup: () => void;
    let _href: string;
    let interceptedState: any;

    beforeAll(() => {
        // Mock window.location and window.history for multi-hash mode
        // @ts-expect-error Missing window features for testing
        globalThis.window.location = {
            get href() {
                return _href;
            },
            set href(value) {
                _href = value;
            }
        };
        // @ts-expect-error Missing window features for testing
        globalThis.window.history = {
            get state() {
                return interceptedState;
            },
            pushState: vi.fn(),
            replaceState: vi.fn()
        };
        
        // Set initial clean state
        _href = initialUrl;
        interceptedState = { path: undefined, hash: {} };
        
        // Re-initialize with multi-hash mode
        cleanup = init({ hashMode: 'multi' });
    });
    
    beforeEach(() => {
        // Reset to clean state before each test
        globalThis.window.location.href = initialUrl;
        interceptedState = { path: undefined, hash: {} };
    });
    
    afterAll(() => {
        cleanup?.();
    });

    beforeEach(() => {
        // Set up initial state with path and multiple named hash states
        location.navigate('/initial-path', { state: { path: 'initial' } });
        location.navigate('/universe1', { hash: 'universe1', state: { u1: 'data1' } });
        location.navigate('/universe2', { hash: 'universe2', state: { u2: 'data2' } });
        location.navigate('/universe3', { hash: 'universe3', state: { u3: 'data3' } });
    });

    test('Named hash routing should preserve existing path state and other named hash states', () => {
        // Act - update only universe2
        const newState = calculateState('universe2', { u2: 'updated' });

        // Assert - all other states should be preserved
        expect(newState).toEqual({
            path: { path: 'initial' },
            hash: {
                universe1: { u1: 'data1' },
                universe2: { u2: 'updated' },  // Only this should change
                universe3: { u3: 'data3' }
            }
        });
    });

    test('Path routing should preserve all existing named hash states', () => {
        // Act.
        const newState = calculateState(false, { path: 'updated' });

        // Assert.
        expect(newState).toEqual({
            path: { path: 'updated' },  // Only this should change
            hash: {
                universe1: { u1: 'data1' },
                universe2: { u2: 'data2' },
                universe3: { u3: 'data3' }
            }
        });
    });

    test('Adding a new named hash universe should preserve all existing states', () => {
        // Act - add a new universe
        const newState = calculateState('universe4', { u4: 'new' });

        // Assert.
        expect(newState).toEqual({
            path: { path: 'initial' },
            hash: {
                universe1: { u1: 'data1' },
                universe2: { u2: 'data2' },
                universe3: { u3: 'data3' },
                universe4: { u4: 'new' }  // New universe added
            }
        });
    });

    test('Traditional hash routing should NOT preserve named hash states (mode switch)', () => {
        // Act - switch to traditional hash mode
        const newState = calculateState(true, { single: 'traditional' });

        // Assert - should only have single hash state (self-cleaning)
        expect(newState).toEqual({
            path: { path: 'initial' },  // Path preserved
            hash: { single: { single: 'traditional' } }  // All named hashes cleared
        });
    });
});
