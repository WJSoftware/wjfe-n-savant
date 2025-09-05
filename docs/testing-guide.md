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
export const ROUTING_UNIVERSES: {
    hash: Hash | undefined;
    implicitMode: RoutingOptions['implicitMode'];
    hashMode: Exclude<RoutingOptions['hashMode'], undefined>;
    text: string;
    name: string;
}[] = [
    { hash: undefined, implicitMode: 'path', hashMode: 'single', text: "IMP", name: "Implicit Path Routing" },
    { hash: undefined, implicitMode: 'hash', hashMode: 'single', text: "IMH", name: "Implicit Hash Routing" },
    { hash: false, implicitMode: 'path', hashMode: 'single', text: "PR", name: "Path Routing" },
    { hash: true, implicitMode: 'path', hashMode: 'single', text: "HR", name: "Hash Routing" },
    { hash: 'p1', implicitMode: 'path', hashMode: 'multi', text: "MHR", name: "Multi Hash Routing" },
] as const;

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
    nonMatching: 1,        // Adds 1 non-matching route
    ignoreForFallback: 1   // Adds 1 route that ignores fallback
});

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
} from "$lib/testing/test-utils.js";
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

## Test Utilities Location

Test utilities are located in `src/lib/testing/` and excluded from the published package via the `"files"` property in `package.json`. During development, they build to `dist/testing/` but are not included in `npm pack`.
