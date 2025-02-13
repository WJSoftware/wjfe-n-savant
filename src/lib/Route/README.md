# Route

The `Route` component is used to define a route within a `Router` component. It matches the current URL against its 
path and renders its children if the path matches.

## Props

| Property | Type | Default Value | Bindable | Description |
|-|-|-|-|-|
| `key` | `string` | (none) | | Sets the route's unique key. |
| `path` | `string \| RegExp` | (none) | | Sets the route's path pattern, or a regular expression used to test and match the browser's URL. |
| `and` | `(params: Record<RouteParameters<T>, string> \| undefined) => boolean` | `undefined` | | Sets a function for additional matching conditions. |
| `when` | `(routeStatus: Record<string, RouteStatus>) => boolean` | `undefined` | | Sets a function for additional matching conditions. |
| `params` | `Record<RouteParameters<T>, string>` | `undefined` | Yes | Provides a way to obtain a route's parameters through property binding. |
| `children` | `Snippet<[Record<RouteParameters<T>, string> \| undefined]>` | `undefined` | | Renders the children of the route. |

## Examples

### Basic Usage

Simplest form of use.

```svelte
<script lang="ts">
    import { Router, Route } from '@wjfe/n-savant';
</script>

<Router>
    <Route path="/home">
        <h1>Welcome to the home page!</h1>
    </Route>
    <Route path="/about">
        <h1>About Us</h1>
    </Route>
    <Route path="/contact">
        <h1>Contact Us</h1>
    </Route>
</Router>
```

### Base Path

Use a base path whenever your application is being served from a non-root location, or in micro-frontend scenarios where 
the MFE is meant to respond to sub-path routes only.

```svelte
<script lang="ts">
    import { Router, Route } from '@wjfe/n-savant';
</script>

<Router basePath="/subpath">
    ...
</Router>
```

### Nested Routes

Nest a router inside a route or router.  The nested router inherits the previous router's base path.  Add path segments 
as needed.

```svelte
<script lang="ts">
    import { Router, Route } from '@wjfe/n-savant';
</script>

<Router basePath="/root">
    <Route path="/home">
        <h1>Welcome to the home page!</h1>
        <p>The Route component matched /root/home.</p>
    </Route>
    <Route path="/about">
        <h1>About Us</h1>
    </Route>
    <Route path="/contact">
        <h1>Contact Us</h1>
    </Route>
    <Router basePath="/admin">
        <Route path="/dashboard">
            <h1>Admin Dashboard</h1>
            <p>The Route component matched /root/admin/dashboard.</p>
        </Route>
        <Route path="/users">
            <h1>Admin Users</h1>
        </Route>
    </Router>
</Router>
```

### Fallback Content

Use the `fallback()` snippet of the router to present content when no routes match.

```svelte
<script lang="ts">
    import { Router, Route } from '@wjfe/n-savant';
</script>

<Router>
    <Route path="/home">
        <h1>Welcome to the home page!</h1>
    </Route>
    <Route path="/about">
        <h1>About Us</h1>
    </Route>
    <Route path="/contact">
        <h1>Contact Us</h1>
    </Route>
    {#snippet fallback()}
        <h1>404 Not Found</h1>
    {/snippet}
</Router>
```

### Route Parameters

Parameters are expressed in the form `:<name>[?]`.  The optional `"?"` makes the parameter optional.

```svelte
<script lang="ts">
    import { Router, Route } from '@wjfe/n-savant';
    import UserProfile from '$lib/components/user-profile.svelte';
    import UserDetails from '$lib/components/user-details.svelte';
</script>

<Router>
    <Route path="/user/:id/:detailed?">
        {#snippet children(params)}
            <UserProfile id={params.id} />
            {#if params.detailed}
                <UserDetails id={params.id} />
            {/if}
        {/snippet}
    </Route>
</Router>
```

### Rest Parameter

Collect the "rest" of the URL using an `"*"` at the end of the path.  This will create the named parameter `rest`, so 
never use this name as a name for one of your parameters.

```svelte
<script lang="ts">
    import { Router, Route } from '@wjfe/n-savant';
</script>

<Router>
    <Route path="/dashboard/*">
        ...
    </Route>
</Router>
```
