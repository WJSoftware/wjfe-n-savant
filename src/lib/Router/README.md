# Router

The `Router` component is the root component for a routing tree. It creates the router engine and shares it with its 
children via context.

## Props

| Property | Type | Default | Bindable |Description |
| - | - | - | - | - |
| `router` | `RouterEngine` | `undefined` | Yes | Gets or sets the router engine instance to be used by this router. |
| `basePath` | `string` | `'/'` | | Sets the router's base path, which is a segment of the URL that is implicitly added to all routes. |
| `id` | `string` | `undefined` | | Gives the router an identifier that shows up in `RouterTrace` components. |
| `hash` | `boolean \| string` | `undefined` | | Sets the hash mode of the router. |
| `children` | `Snippet<[any, Record<string, RouteStatus>]>` | `undefined` | | Renders the children of the router. |

[Online Documentation](https://wjfe-n-savant.hashnode.space/wjfe-n-savant/components/router)

## Examples

### Basic Usage

Simplest form of use.

```svelte
<script lang="ts">
  import { Router, Route } from '@svelte-router/core';
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
  import { Router, Route } from '@svelte-router/core';
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
  import { Router, Route } from '@svelte-router/core';
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
  import { Router, Route } from '@svelte-router/core';
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
  import { Router, Route } from '@svelte-router/core';
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
  import { Router, Route } from '@svelte-router/core';
</script>

<Router>
  <Route path="/dashboard/*">
    ...
  </Route>
</Router>
```
