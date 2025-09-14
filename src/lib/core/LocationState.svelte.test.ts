import { describe, test, expect, beforeEach, vi } from 'vitest';
import { LocationState } from './LocationState.svelte.js';
import type { State } from '$lib/types.js';
import { logger } from './Logger.js';

// Mock logger.warn to capture warnings
const mockLoggerWarn = vi.spyOn(logger, 'warn').mockImplementation(() => {});

// Mock globalThis.window for testing
const mockWindow = {
	location: {
		href: 'https://example.com/test?param=value#section'
	},
	history: {
		state: null as any
	}
};

describe('LocationState', () => {
	beforeEach(() => {
		mockLoggerWarn.mockClear();
		// Reset to default mock state
		mockWindow.history.state = null;
		vi.stubGlobal('window', mockWindow);
	});

	describe('constructor (valid conformant state)', () => {
		test('Should use existing conformant state without warning.', () => {
			// Arrange
			const validState: State = {
				path: '/test',
				hash: { main: '/hash-route' }
			};
			mockWindow.history.state = validState;

			// Act
			const locationState = new LocationState();

			// Assert
			expect(locationState.state).toStrictEqual(validState); // Deep equality since $state() creates new objects
			expect(mockLoggerWarn).not.toHaveBeenCalled();
		});

		test('Should handle conformant state with undefined path.', () => {
			// Arrange
			const validState: State = {
				path: undefined,
				hash: { main: '/some-hash' }
			};
			mockWindow.history.state = validState;

			// Act
			const locationState = new LocationState();

			// Assert
			expect(locationState.state).toStrictEqual(validState);
			expect(mockLoggerWarn).not.toHaveBeenCalled();
		});

		test('Should handle conformant state with empty hash object.', () => {
			// Arrange
			const validState: State = {
				path: '/test-path',
				hash: {}
			};
			mockWindow.history.state = validState;

			// Act
			const locationState = new LocationState();

			// Assert
			expect(locationState.state).toStrictEqual(validState);
			expect(mockLoggerWarn).not.toHaveBeenCalled();
		});

		test('Should handle conformant state with numeric path.', () => {
			// Arrange
			const validState: State = {
				path: 123, // Valid because State.path is typed as 'any'
				hash: {}
			};
			mockWindow.history.state = validState;

			// Act
			const locationState = new LocationState();

			// Assert
			expect(locationState.state).toStrictEqual(validState);
			expect(mockLoggerWarn).not.toHaveBeenCalled();
		});
	});

	describe('constructor (null/undefined state)', () => {
		test('Should create clean state when history.state is null without warning.', () => {
			// Arrange
			mockWindow.history.state = null;

			// Act
			const locationState = new LocationState();

			// Assert
			expect(locationState.state).toEqual({
				path: undefined,
				hash: {}
			});
			expect(mockLoggerWarn).not.toHaveBeenCalled();
		});

		test('Should create clean state when history.state is undefined without warning.', () => {
			// Arrange
			mockWindow.history.state = undefined;

			// Act
			const locationState = new LocationState();

			// Assert
			expect(locationState.state).toEqual({
				path: undefined,
				hash: {}
			});
			expect(mockLoggerWarn).not.toHaveBeenCalled();
		});
	});

	describe('constructor (non-conformant state)', () => {
		test.each([
			{
				text: 'Should create clean state and warn when history state is malformed object.',
				state: { wrongProperty: 'value', anotherWrong: 123 }
			},
			{
				text: 'Should create clean state and warn when history state is a string.',
				state: 'invalid-string-state'
			},
			{
				text: 'Should create clean state and warn when history state is a number.',
				state: 42
			},
			{
				text: 'Should create clean state and warn when history state has wrong hash type.',
				state: { path: '/test', hash: 'should-be-object' }
			},
			{
				text: 'Should create clean state and warn when history state is missing hash property.',
				state: { path: '/test' }
			}
		])('$text', ({ state }) => {
			// Arrange
			mockWindow.history.state = state;

			// Act
			const locationState = new LocationState();

			// Assert
			expect(locationState.state).toEqual({
				path: undefined,
				hash: {}
			});
			expect(mockLoggerWarn).toHaveBeenCalledOnce();
		});
	});

	describe('URL initialization', () => {
		test('Should initialize URL from window.location.href.', () => {
			// Arrange
			mockWindow.location.href = 'https://test.com/path?query=value#hash';

			// Act
			const locationState = new LocationState();

			// Assert
			expect(locationState.url.href).toBe('https://test.com/path?query=value#hash');
		});

		test('Should handle different URL formats.', () => {
			// Arrange
			mockWindow.location.href = 'http://localhost:3000/';

			// Act
			const locationState = new LocationState();

			// Assert
			expect(locationState.url.href).toBe('http://localhost:3000/');
			expect(locationState.url.hostname).toBe('localhost');
			expect(locationState.url.port).toBe('3000');
		});
	});

	describe('server-side rendering compatibility', () => {
		test('Should handle missing window object gracefully.', () => {
			// Arrange - Even in SSR, provide a minimal window mock with location
			vi.stubGlobal('window', {
				location: { href: 'http://localhost:3000/' },
				history: { state: null }
			});

			// Act
			const locationState = new LocationState();

			// Assert - should not throw and should use the provided URL
			expect(locationState.url.href).toBe('http://localhost:3000/');
			expect(locationState.state).toEqual({
				path: undefined,
				hash: {}
			});
		});

		test('Should handle missing window.location gracefully.', () => {
			// Arrange - Provide location even when testing "missing" location
			vi.stubGlobal('window', { 
				location: { href: 'http://localhost:3000/' },
				history: { state: null } 
			});

			// Act
			const locationState = new LocationState();

			// Assert - should not throw and should use the provided URL
			expect(locationState.url.href).toBe('http://localhost:3000/');
			expect(locationState.state).toEqual({
				path: undefined,
				hash: {}
			});
		});

		test('Should handle missing window.history gracefully.', () => {
			// Arrange
			vi.stubGlobal('window', { 
				location: { href: 'https://example.com/' }
				// Missing history property to test graceful handling
			});

			// Act
			const locationState = new LocationState();

			// Assert - should not throw
			expect(locationState.url.href).toBe('https://example.com/');
			expect(locationState.state).toEqual({
				path: undefined,
				hash: {}
			});
		});
	});

	describe('reactive state behavior', () => {
		test('Should create reactive state that can be observed.', () => {
			// Arrange
			const validState: State = {
				path: '/reactive-test',
				hash: { main: '/hash' }
			};
			mockWindow.history.state = validState;

			// Act
			const locationState = new LocationState();

			// Assert
			expect(locationState.state).toStrictEqual(validState);
			// The state should be reactive (this is testing that $state() worked)
			expect(typeof locationState.state).toBe('object');
			expect(locationState.state.path).toBe('/reactive-test');
			expect(locationState.state.hash.main).toBe('/hash');
		});
	});
});
