# N-Savant Routing Library - Testing Guide

## Library Architecture Overview

### Routing Universes Concept

The @wjfe/n-savant routing library supports simultaneous path and hash routing through "routing universes":

- **Path Routing** (`hash: false`): Uses URL pathname
- **Single Hash Routing** (`hash: true`): Uses URL hash as a single path (e.g., `#/path/to/route`)
- **Multi Hash Routing** (`hash: 'p1'`): Uses semicolon-separated hash segments (e.g., `#p1=/path;p2=/other`)
- **Implicit Path Routing** (`hash: undefined`, `implicitMode: 'path'`): Resolves to path routing
- **Implicit Hash Routing** (`hash: undefined`, `implicitMode: 'hash'`): Resolves to hash routing

#### Example Multi-Universe Setup
```svelte
<Router>
    <Route path="/hash-feature/*">
        <Router hash>
            <Route hash path="/">
                <RouteHashHome />
            </Route>
            <Route path="/non-hash-route">
                <NonHashContentForSomeReason />
            </Route>
        </Router>
    </Route>
</Router>
```

### Context System

Context is stored per universe using Svelte's `setContext()` with keys from `getRouterContextKey()`:
- Path routing: `parentCtxKey` symbol
- Single hash routing: `hashParentCtxKey` symbol  
- Multi hash routing: `Symbol.for('hsh-${hashId}')` per hash ID

### RouterEngine Core

The `RouterEngine` class is the heart of the routing system:

#### Routes Structure
```typescript
routes: Record<string, RouteInfo>
```

Where `RouteInfo` contains:
- `pattern?: string` or `regex?: RegExp`: For URL matching
- `and?: (routeParams) => boolean`: Additional predicate for guarded routes
- `ignoreForFallback?: boolean`: Excludes route from fallback calculations

#### Reactive Properties
- `routeStatus`: Per-route match status and extracted parameters
- `noMatches`: Boolean indicating NO routes matched (excluding `ignoreForFallback` routes)

### Component Architecture

#### Router Component
- Creates `RouterEngine` instance
- Sets up context for child components
- Provides `state` and `routeStatus` to children

#### Route Component
- Registers route patterns with parent router
- Uses context to find parent router
- Props: `path` (string pattern/regex) and `and` (predicate function)

#### Fallback Component
- Shows content when no routes match
- Props:
  - `hash`: Routing universe selector
  - `when?: WhenPredicate`: Override default `noMatches` behavior
  - `children`: Content snippet

Render logic:
```svelte
{#if (router && when?.(router.routeStatus, router.noMatches)) || (!when && router?.noMatches)}
  {@render children?.(router.state, router.routeStatus)}
{/if}
```

## Testing Patterns & Best Practices

### Test Structure Categories

#### **1. Default Props Tests**
Test component behavior with minimal/default property values:
```typescript
function defaultPropsTests(setup: ReturnType<typeof createRouterTestSetup>) {
    beforeEach(() => setup.init());
    afterAll(() => setup.dispose());
    
    test("Should behave correctly with default props", () => {
        // Test with hash: undefined and minimal props
        const { hash, context } = setup;
        render(Component, { props: { hash, children: content }, context });
        // Assert default behavior
    });
}
```

#### **2. Explicit Props Tests**  
Test specific property configurations and overrides:
```typescript
function explicitPropsTests(setup: ReturnType<typeof createRouterTestSetup>) {
    test.each([
        { propValue: value1, scenario: "scenario1" },
        { propValue: value2, scenario: "scenario2" }
    ])("Should handle $scenario", ({ propValue }) => {
        render(Component, { 
            props: { hash, specificProp: propValue, children: content }, 
            context 
        });
        // Assert specific behavior
    });
}
```

#### **3. Reactivity Tests**
Test two distinct types of reactivity:

**A. Prop Value Changes** (Component prop reactivity):
```typescript
test("Should re-render when prop value changes", async () => {
    const { rerender } = render(Component, {
        props: { when: () => false, children: content }
    });
    
    // Change the entire prop value
    await rerender({ when: () => true, children: content });
    
    // Assert new behavior
});
```

**B. Reactive State Changes** (Svelte rune reactivity):
```typescript
test("Should re-render when reactive dependency changes", async () => {
    let reactiveState = $state(false);
    
    render(Component, {
        props: { when: () => reactiveState, children: content } // Same function, reactive dependency
    });
    
    // Change the reactive state
    reactiveState = true;
    flushSync(); // Ensure reactive updates are processed
    
    // Assert reactive behavior
});
```

### Testing Principles

#### **Focus on Observable Behavior, Not Implementation**
```typescript
// ✅ Good - Test what the user sees
test("Should hide content when routes match", () => {
    addMatchingRoute(router);
    const { queryByText } = render(Component, { props, context });
    expect(queryByText("content")).toBeNull();
});

// ❌ Bad - Test internal implementation
test("Should call router.noMatches", () => {
    const spy = vi.spyOn(router, 'noMatches');
    render(Component, { props, context });
    expect(spy).toHaveBeenCalled(); // Testing implementation detail
});
```

#### **Maintain Clear Testing Boundaries**
```typescript
// ✅ Component tests focus on component behavior
test("Component renders when condition is met", () => {
    // Setup: Create the condition (however that's achieved)
    // Test: Component responds correctly
});

// ✅ Router tests focus on router logic (separate file)
test("Router calculates noMatches correctly", () => {
    // Test router's internal logic
});
```

#### **Ensure Test Isolation**
```typescript
// ✅ Fresh instance for each test
beforeEach(() => {
    setup.init(); // Creates new router
});

// ❌ Reusing router instances
beforeAll(() => {
    setup.init(); // Same router for all tests - bad!
});
```

Use data-driven testing across **all 5 routing universes**:

```typescript
// Import the complete universe definitions
import { ROUTING_UNIVERSES } from "../testing/test-utils.js";

ROUTING_UNIVERSES.forEach((ru) => {
    describe(`Component - ${ru.text}`, () => {
        let cleanup: () => void;
        beforeAll(() => {
            cleanup = init({ 
                implicitMode: ru.implicitMode,
                hashMode: ru.hashMode
            });
        });
        afterAll(() => {
            cleanup();
        });
        
        describe("Default Props", () => {
            // Component behavior with minimal/default props
        });
        describe("Explicit Props", () => {
            // Testing specific prop configurations
        });
        describe("Reactivity", () => {
            // Testing dynamic changes and reactive behavior
        });
    });
});
```

See `src/testing/test-utils.ts` for the complete `ROUTING_UNIVERSES` array definition with all universe configurations.

### Context Setup

```typescript
function createRouterTestSetup(hash: Hash | undefined) {
    let router: RouterEngine | undefined;
    let context: Map<any, any>;
    
    const init = () => {
        // Dispose previous router if it exists
        router?.dispose();
        
        // Create fresh router and context for each test
        router = new RouterEngine({ hash });
        context = new Map();
        context.set(getRouterContextKey(hash), router);
    };
    
    const dispose = () => {
        router?.dispose();
        router = undefined;
        context = new Map();
    };
    
    return {
        get hash() { return hash; },
        get router() { 
            if (!router) throw new Error('Router not initialized. Call init() first.');
            return router; 
        },
        get context() { 
            if (!context) throw new Error('Context not initialized. Call init() first.');
            return context; 
        },
        init,
        dispose
    };
}

// Usage in tests
beforeEach(() => {
    setup.init(); // Fresh router for each test
});

afterAll(() => {
    setup.dispose(); // Clean disposal
});
```

### Route Manipulation

```typescript
// Add a single matching route
addMatchingRoute(router, 'optionalRouteName');

// Add a single non-matching route  
addNonMatchingRoute(router, 'optionalRouteName');

// Add multiple routes at once
addRoutes(router, {
    matching: 2,           // Adds 2 matching routes
    nonMatching: 1         // Adds 1 non-matching route
});

// Add explicit custom routes using rest parameters
addRoutes(router, 
    { matching: 1 },
    { pattern: "/api/:id", name: "api-route" },
    { regex: /^\/test$/ } // Auto-generated name
);

// Manual route addition
router.routes["routeName"] = {
    pattern: "/some/path",
    and: () => true,
    ignoreForFallback: false
};
```

### Testing Library Performance Tips

- **Use `queryByText`** for negative assertions (element should NOT exist)
- **Use `findByText`** for positive assertions (element should exist)
- **Avoid `expect().rejects`** with `findByText` - it waits 1000ms timeout

```typescript
// ❌ Slow - waits 1000ms timeout
await expect(findByText(content)).rejects.toThrow();

// ✅ Fast - immediate result
expect(queryByText(content)).toBeNull();
```

### Required Imports

```typescript
import { init, type Hash } from "$lib/index.js";
import { describe, test, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { render } from "@testing-library/svelte";
import { RouterEngine } from "$lib/core/RouterEngine.svelte.js";
import { getRouterContextKey } from "../Router/Router.svelte";
import { createRawSnippet } from "svelte";
import { flushSync } from "svelte"; // For Svelte 5 reactivity testing
import { 
    addMatchingRoute, 
    addRoutes, 
    createRouterTestSetup, 
    createTestSnippet, 
    ROUTING_UNIVERSES 
} from "../testing/test-utils.js"; // Note: moved outside $lib
```

### Snippet Creation for Testing

```typescript
// Using test utility (recommended)
const content = createTestSnippet("Component content text");

// Manual creation
const contentText = "Component content.";
const content = createRawSnippet(() => {
    return {
        render: () => `<div>${contentText}</div>`
    };
});
```

## Test File Naming for Svelte 5

**Important**: For tests that use Svelte 5 runes (`$state`, `$derived`, etc.), name your test files with `.svelte.test.ts`:

```
✅ Component.svelte.test.ts  // Enables Svelte runes
❌ Component.test.ts         // Standard test file
```

This allows you to use reactive state in tests:
```typescript
test("Should react to state changes", () => {
    let reactiveValue = $state(false);
    
    render(Component, {
        props: { when: () => reactiveValue }
    });
    
    reactiveValue = true;
    flushSync(); // Ensure reactive updates are processed
});
```

## Library Initialization

The `init()` function:
- Passes library configuration to global singleton
- Creates new Location implementation instance
- Required when library configurations change
- Multi hash routing needs cleanup between tests

```typescript
// Standard init
const cleanup = init();

// Multi hash mode
const cleanup = init({ hashMode: 'multi' });

// Always cleanup
afterAll(() => {
    cleanup();
});
```

## Component-Specific Testing Notes

### Fallback Component

**Purpose**: Render content when no routes match, with override capability

**Key behaviors to test**:
1. Shows when `router.noMatches` is true
2. Hides when routes are matching  
3. Respects `when` predicate override
4. Works across all routing universes

**Common test scenarios**:
- Empty router (no routes) → should show
- Router with matching routes → should hide
- Router with only `ignoreForFallback` routes → should show
- Custom `when` predicate scenarios

### Route Component

**Purpose**: Register route patterns and respond to matches

**Key behaviors to test**:
1. Route registration with parent router
2. Pattern matching (string patterns, regex, parameters)
3. `and` predicate evaluation
4. `ignoreForFallback` behavior

### Router Component

**Purpose**: Create routing context and manage child routes

**Key behaviors to test**:
1. Context creation and propagation
2. Base path handling
3. Route status calculation
4. State management per universe

## Common Gotchas

1. **Context Keys**: Must use correct `getRouterContextKey(hash)` for each universe
2. **Cleanup**: Multi hash routing requires proper `init()` cleanup between test suites
3. **Route Clearing**: Always clear `router.routes` between tests for clean slate
4. **Async Testing**: Use `queryByText` for immediate results vs `findByText` for async waiting
5. **Hash Values**: Ensure hash values match between component props and context setup
6. **File Naming**: Use `.svelte.test.ts` for files that need Svelte runes support
7. **Reactivity**: Remember to call `flushSync()` after changing reactive state
8. **Prop vs State Reactivity**: Test both prop changes AND reactive dependency changes

## Advanced Testing Infrastructure

### Browser API Mocking

For testing components that rely on `window.location` and `window.history` (like `RouterEngine`), use the comprehensive browser mocking utilities:

```typescript
import { setupBrowserMocks } from "../testing/test-utils.js";

describe("Component requiring browser APIs", () => {
    beforeEach(() => {
        // Automatically mocks window.location, window.history, and integrates with library Location
        setupBrowserMocks("/initial/path");
    });
    
    test("Should respond to location changes", () => {
        // Browser APIs are now mocked and integrated with library
        window.history.pushState({}, "", "/new/path");
        // Test component behavior
    });
});
```

**What `setupBrowserMocks()` provides**:
- Complete `window.location` mock with all properties (href, pathname, hash, search, etc.)
- Full `window.history` mock with `pushState`, `replaceState`, and state management
- Automatic `popstate` event triggering on location changes
- Integration with library's `LocationLite` for synchronized state
- Proper cleanup between tests

### Enhanced Route Management

The `addRoutes()` utility supports multiple approaches for flexible route setup:

```typescript
// Simple route counts
addRoutes(router, { matching: 2, nonMatching: 1 });

// RouteSpecs approach for custom route definitions
addRoutes(router, { 
    matching: { count: 2, specs: { pattern: "/custom/:id" } },
    nonMatching: { count: 1, specs: { pattern: "/other" } }
});

// Rest parameters for explicit route definitions (NEW)
addRoutes(router, 
    { matching: 1, nonMatching: 0 },
    { pattern: "/api/users/:id", name: "user-detail" },
    { regex: /^\/products\/\d+$/, name: "product" },
    { pattern: "/settings" } // Name auto-generated if not provided
);

// Combined approach
addRoutes(router,
    { matching: 2 }, // Generate 2 matching routes
    { pattern: "/custom", name: "custom-route" }, // Add specific route
    { pattern: "/another" } // Add another with auto-generated name
);
```

**Rest Parameters Benefits:**
- **Explicit control**: Define exact routes with specific patterns/regex
- **Named routes**: Optional `name` property for predictable route keys
- **Type safety**: Full IntelliSense support for `RouteInfo` properties
- **Flexible mixing**: Combine generated routes with explicit definitions

Refer to `src/testing/test-utils.ts` for complete function signatures and type definitions.

### Universe-Based Testing Pattern

**Complete test coverage across all 5 routing universes** using the standardized pattern:

```typescript
import { ROUTING_UNIVERSES } from "../testing/test-utils.js";

// ✅ Recommended: Test ALL universes with single loop
ROUTING_UNIVERSES.forEach((universe) => {
    describe(`Component (${universe.text})`, () => {
        let cleanup: () => void;
        let setup: ReturnType<typeof createRouterTestSetup>;
        
        beforeAll(() => {
            cleanup = init({ 
                implicitMode: universe.implicitMode,
                hashMode: universe.hashMode
            });
            setup = createRouterTestSetup(universe.hash);
        });
        
        afterAll(() => {
            cleanup();
            setup.dispose();
        });
        
        beforeEach(() => {
            setup.init(); // Fresh router per test
            setupBrowserMocks("/"); // Fresh browser state
        });
        
        test(`Should behave correctly in ${universe.text}`, () => {
            // Test logic that works across all universes
            const { hash, context, router } = setup;
            
            // Use universe.text for concise test descriptions
            expect(universe.text).toMatch(/^(IMP|IMH|PR|HR|MHR)$/);
        });
    });
});
```

**Benefits**:
- **100% Universe Coverage**: Ensures behavior works across all routing modes
- **Consistent Test Structure**: Standardized setup and teardown patterns
- **Efficient Execution**: Vitest's dynamic skipping capabilities maintain performance
- **Clear Reporting**: Each universe shows as separate test suite with meaningful names

### Self-Documenting Test Constants

Use dictionary-based constants for better maintainability:

```typescript
// Import self-documenting hash values
import { ALL_HASHES } from "../testing/test-utils.js";

// Usage in tests
test("Should validate hash compatibility", () => {
    expect(() => {
        new RouterEngine({ hash: ALL_HASHES.single });
    }).not.toThrow();
});
```

See `src/testing/test-utils.ts` for the complete `ALL_HASHES` dictionary definition.

**Dictionary Benefits**:
- **Self-Documentation**: `ALL_HASHES.single` is clearer than `true`
- **Single Source of Truth**: Change values in one place
- **Type Safety**: TypeScript can validate usage
- **Discoverability**: IDE autocomplete shows available options

### Constructor Validation Testing

For components with runtime validation, test all error scenarios systematically:

```typescript
describe("Constructor hash validation", () => {
    test.each([
        { parent: ALL_HASHES.path, child: ALL_HASHES.single, desc: 'path parent vs hash child' },
        { parent: ALL_HASHES.single, child: ALL_HASHES.path, desc: 'hash parent vs path child' },
        { parent: ALL_HASHES.multi, child: ALL_HASHES.path, desc: 'multi-hash parent vs path child' },
        { parent: ALL_HASHES.path, child: ALL_HASHES.multi, desc: 'path parent vs multi-hash child' }
    ])("Should throw error when parent and child have different hash modes: '$desc'", ({ parent, child }) => {
        expect(() => {
            const parentRouter = new RouterEngine({ hash: parent });
            new RouterEngine(parentRouter, { hash: child });
        }).toThrow("Parent and child routers must use the same hash mode");
    });
    
    test.each([
        { parent: ALL_HASHES.path, desc: 'path parent' },
        { parent: ALL_HASHES.single, desc: 'hash parent' },
        { parent: ALL_HASHES.multi, desc: 'multi-hash parent' }
    ])("Should allow child router without explicit hash to inherit parent's hash: '$desc'", ({ parent }) => {
        expect(() => {
            const parentRouter = new RouterEngine({ hash: parent });
            new RouterEngine(parentRouter);
        }).not.toThrow();
    });
});
```

### Performance Optimizations

**Browser Mock State Synchronization**:
```typescript
// ✅ Automatic state sync - setupBrowserMocks handles this
// Best practice: pass the library's location object for full integration
setupBrowserMocks("/initial", libraryLocationObject);
window.history.pushState({}, "", "/new"); // Automatically triggers popstate

// ❌ Manual sync required (old approach)
mockLocation.pathname = "/new";
window.dispatchEvent(new PopStateEvent('popstate')); // Manual event trigger
```

**Efficient Test Assertions**:
```typescript
// ✅ Fast negative assertions
expect(queryByText("should not exist")).toBeNull();

// ❌ Slow - waits for timeout
await expect(findByText("should not exist")).rejects.toThrow();

// ✅ Use findByText for elements that should exist
const element = await findByText("should exist");
expect(element).toBeInTheDocument();
```

## Test Utilities Location

Test utilities are centralized in `src/testing/test-utils.ts` (moved from `src/lib/testing/` for better organization) and excluded from the published package via the `"files"` property in `package.json`. During development, they build to `dist/testing/` but are not included in `npm pack`.

**Key utilities**:
- `setupBrowserMocks()`: Complete browser API mocking with library integration
- `addRoutes()`: Enhanced route management with RouteSpecs support
- `createRouterTestSetup()`: Standardized router setup with proper lifecycle
- `ROUTING_UNIVERSES`: Complete universe definitions for comprehensive testing
- `ALL_HASHES`: Self-documenting hash value constants
