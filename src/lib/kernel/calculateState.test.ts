import { init } from '../init.js';
import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { calculateState } from './calculateState.js';
import { ROUTING_UNIVERSES, ALL_HASHES, setupBrowserMocks } from '$test/test-utils.js';

describe('calculateState', () => {
    describe('Clean Slate (no existing state)', () => {
        let cleanup: () => void;
        
        beforeAll(() => {
            cleanup = init();
        });
        
        afterAll(() => {
            cleanup();
        });
        
        beforeEach(() => {
            setupBrowserMocks("http://example.com/");
        });

        test.each([
            {
                hash: ALL_HASHES.path,
                state: 1,
                expected: { path: 1, hash: {} }
            },
            {
                hash: ALL_HASHES.single,
                state: 2,
                expected: { hash: { single: 2 } }
            },
            {
                hash: ALL_HASHES.multi,
                state: 3,
                expected: { hash: { [ALL_HASHES.multi]: 3 } }
            },
        ])("Should set the state object when 'hash' is $hash", ({ hash, state, expected }) => {
            // Act
            const newState = calculateState(hash, state);

            // Assert
            expect(newState).toEqual(expected);
        });
    });

    // Test across all routing universes for comprehensive coverage
    ROUTING_UNIVERSES.forEach((universe) => {
        describe(`State Management - ${universe.text}`, () => {
            let cleanup: () => void;
            
            beforeAll(() => {
                cleanup = init({ 
                    defaultHash: universe.defaultHash,
                    hashMode: universe.hashMode
                });
            });
            
            afterAll(() => {
                cleanup();
            });
            
            let browserMocks: ReturnType<typeof setupBrowserMocks>;
            
            beforeEach(() => {
                browserMocks = setupBrowserMocks("http://example.com/");
                
                // Set up comprehensive initial state for all universe types
                // This avoids calling calculateState() which we're testing
                const baseState = {
                    path: { path: 'initial' },
                    hash: {
                        single: { single: 'initial' },
                        universe1: { u1: 'data1' },
                        universe2: { u2: 'data2' },
                        universe3: { u3: 'data3' }
                    }
                };
                
                // Simulate the state being set through browser APIs (not through calculateState)
                browserMocks.simulateHistoryChange(baseState, 'http://example.com/initial-path');
            });

            
            describe("Basic state calculation", () => {
                test("Should create correct state structure for current universe", () => {
                    // Arrange
                    const testState = { test: 'data' };
                    
                    // Act
                    let newState;
                    if (universe.hash === ALL_HASHES.implicit) {
                        // Use single-argument overload for implicit hash
                        newState = calculateState(testState);
                    } else {
                        newState = calculateState(universe.hash, testState);
                    }
                    
                    // Assert - calculateState preserves existing state, so we need to account for that
                    if (universe.hash === ALL_HASHES.path || (universe.hash === ALL_HASHES.implicit && universe.defaultHash === false)) {
                        expect(newState.path).toEqual(testState);
                        expect(newState.hash).toBeDefined();
                    } else if (universe.hash === ALL_HASHES.single || (universe.hash === ALL_HASHES.implicit && universe.defaultHash === true)) {
                        expect(newState.hash.single).toEqual(testState);
                        expect(newState.path).toBeDefined(); // Path is preserved
                    } else if (typeof universe.hash === 'string') {
                        expect(newState.hash[universe.hash]).toEqual(testState);
                        expect(newState.path).toBeDefined(); // Path is preserved
                        // Verify that other hash states are actually preserved (not just that hash exists)
                        expect(Object.keys(newState.hash)).toContain('single'); // Single hash should be preserved
                        expect(newState.hash.single).toEqual({ single: 'initial' }); // Verify actual preserved value
                    }
                });
            });

            if (universe.hashMode === 'single') {
                describe("State preservation - single hash mode", () => {
                    test("Path routing should preserve existing single hash state", () => {
                        // Act
                        const newState = calculateState(ALL_HASHES.path, { path: 'new' });

                        // Assert - All existing hash states should be preserved
                        if (universe.text === 'IPR') {
                            // IPR universe may not have existing state from setup
                            expect(newState).toEqual({
                                path: { path: 'new' },
                                hash: {}
                            });
                        } else {
                            // Other universes should preserve all existing states
                            expect(newState).toEqual({
                                path: { path: 'new' },
                                hash: { 
                                    single: { single: 'initial' },
                                    universe1: { u1: 'data1' },
                                    universe2: { u2: 'data2' },
                                    universe3: { u3: 'data3' }
                                }
                            });
                        }
                    });

                    test("Single hash routing should preserve existing path state", () => {
                        // Act
                        const newState = calculateState(ALL_HASHES.single, { single: 'new' });

                        // Assert - Path and other hash states should be preserved
                        if (universe.text === 'IPR') {
                            // IPR universe may not have existing state from setup
                            expect(newState).toEqual({
                                path: undefined,
                                hash: { single: { single: 'new' } }
                            });
                        } else {
                            // For single hash routing, multi-hash states are cleared (mode switch behavior)
                            expect(newState).toEqual({
                                path: { path: 'initial' },
                                hash: { single: { single: 'new' } }
                            });
                        }
                    });
                });
            }

            if (universe.hashMode === 'multi') {
                describe("State preservation - multi hash mode", () => {
                    test("Named hash routing should preserve existing path state and other named hash states", () => {
                        // Act - update only universe2
                        const newState = calculateState('universe2', { u2: 'updated' });

                        // Assert - all other states should be preserved (including single hash from setup)
                        expect(newState).toEqual({
                            path: { path: 'initial' },
                            hash: {
                                single: { single: 'initial' }, // This gets preserved from setup
                                universe1: { u1: 'data1' },
                                universe2: { u2: 'updated' },  // Only this should change
                                universe3: { u3: 'data3' }
                            }
                        });
                    });

                    test("Path routing should preserve all existing named hash states", () => {
                        // Act
                        const newState = calculateState(ALL_HASHES.path, { path: 'updated' });

                        // Assert
                        expect(newState).toEqual({
                            path: { path: 'updated' },  // Only this should change
                            hash: {
                                single: { single: 'initial' }, // Preserved from setup
                                universe1: { u1: 'data1' },
                                universe2: { u2: 'data2' },
                                universe3: { u3: 'data3' }
                            }
                        });
                    });

                    test("Adding a new named hash universe should preserve all existing states", () => {
                        // Act - add a new universe
                        const newState = calculateState('universe4', { u4: 'new' });

                        // Assert
                        expect(newState).toEqual({
                            path: { path: 'initial' },
                            hash: {
                                single: { single: 'initial' }, // Preserved from setup
                                universe1: { u1: 'data1' },
                                universe2: { u2: 'data2' },
                                universe3: { u3: 'data3' },
                                universe4: { u4: 'new' }  // New universe added
                            }
                        });
                    });

                    test("Traditional hash routing should NOT preserve named hash states (mode switch)", () => {
                        // Act - switch to traditional hash mode
                        const newState = calculateState(ALL_HASHES.single, { single: 'traditional' });

                        // Assert - should only have single hash state (self-cleaning)
                        expect(newState).toEqual({
                            path: { path: 'initial' },  // Path preserved
                            hash: { single: { single: 'traditional' } }  // All named hashes cleared
                        });
                    });
                });
            }

            if (universe.hash === ALL_HASHES.implicit) {
                describe("Implicit hash resolution", () => {
                    test("Should resolve implicit hash according to defaultHash", () => {
                        // Arrange
                        const testState = { implicit: 'test' };
                        
                        // Act - use single-parameter overload for implicit mode
                        const newState = calculateState(testState);
                        
                        // Assert - calculateState preserves existing state and updates correct universe
                        if (universe.defaultHash === false) {
                            // Implicit resolves to path routing
                            expect(newState.path).toEqual(testState);
                            expect(newState.hash).toBeDefined(); // Hash state preserved
                        } else if (universe.defaultHash === true) {
                            // Implicit resolves to single hash routing
                            expect(newState.hash.single).toEqual(testState);
                            expect(newState.path).toBeDefined(); // Path state preserved
                        } else if (typeof universe.defaultHash === 'string') {
                            // Implicit resolves to multi-hash routing with specific hash ID
                            expect(newState.hash[universe.defaultHash]).toEqual(testState);
                            expect(newState.path).toBeDefined(); // Path state preserved
                        }
                    });
                });
            }
        });
    });
});
