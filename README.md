# @wjfe/n-savant

> The client-side router for Svelte v5 SPA's that invented multi hash routing.

## Features

> [!NOTE]
> #### Small and Unique!
> 
> + Less than **1.000** lines of code, including TypeScript typing.
> + Always-on path and hash routing.  Simultaneous and independent routing modes.
> + The router that invented multi hash routing.

+ **Reactivity-based**:  All data is reactive, reducing the need for events and imperative programming.
+ **Always-on path and hash routing**:  Add routers that use the URL's path name or the URL's hash value in the same 
application.  Both routing modes are possible simultaneously.
+ **Multi-hash routing**:  This is the first router in the world to do this:  You can create named paths in the hash 
value of the URL and create router hierarchies that use a specific named path.

### `<Router>` Component

+ **Multi-matching routes**:  All routes are evaluated, which is useful to mount micro-frontends.
+ **Base paths**:  Specify base paths that are inherited by routes and nesting routers.
+ **Nesting routers**:  Add child routers inside routers for fine-grained control.
+ **Liberty**:  Place anything anywhere inside.  No child restrictions.

### `<Route>` Component

+ **Exact path matching**:  Exact match by default; specify the rest parameter to relax the condition.
+ **Path as string or regular expression**:  Define paths however's best for you.
+ **Route parameters**:  Define route parameters inside string paths or regular expression paths.
+ **Rest parameter**:  Collect "the rest" of the path.
+ **Optional parameters**:  Parameters may be specified as optional.
+ **Additional matching logic**:  Add a predicate function to further restrict a route's matching ability.
+ **Path is optional**:  Forgo path specification entirely and handle route matching entirely with code.
+ **Superb Intellisense**:  The route parameters are strongly typed when defining them inside a string path.
+ **Disconnected UI pieces**:  Repeat route keys in `Route` components to show disconnected pieces of UI for a given 
route's key.

### `<Fallback>` Component

+ **Non-matching content**:  Show users something when there are no matching routes.
+ **Disconnected content**:  Add as many `Fallback` components as needed in various places.

### `<Link>` Component

+ **Drop-in replacement**:  Exchange `<a>` tags with `<Link>` tags and you're done.
+ **Specify state**:  Set history state upon hyperlink click.
+ **Active state based on route key**:  Automatically set active state and `aria-current` by specifying the route's key.
+ **Replace or push**:  Select the method for pushing state.

### `<LinkContext>` Component

+ **Centralize `<Link>` configuration**:  Configures a special context that all `<Link>` components follow.

### `<RouterTrace>` Component

+ **Tracing Information**:  Drop it inside a router to display its route status data, including the internal regular 
expressions that are generated from string path patterns.
+ **Specify a specific router**:  Ability to give it a specific router engine object, allowing tracing of router engine 
objects created in code.
+ **Track child routers**:  See and traverse the router hierarchy.

### `location` Global Object

+ **Reactive URL**:  URL object that's always in sync with the browser's URL.
+ **Reactive state**:  Reactive state property that's always in sync with the history state.
+ **Reactive hash paths**:  Reactive dictionary object for all hash paths.
+ **Programatic navigation**:  Use the the `navigate()` method to trigger navigation programatically.

#### In Full Mode...

+ **Cancellable `beforeNavigate` event**:  Get notified of navigation events, and cancel when appropriate.
+ **`navigationCancelled` event**:  Get notified whenever navigation is cancelled.
+ **History API interception**:  Gain control over the history object to avoid external code/routers from 
de-synchronizing state.
+ **Micro-frontends**:  Full mode's features are great for micro-frontend scenarios where other routers (from 
potentially other technologies) might interfere with the router's functionality.

## Quickstart

1. Install the package.
2. Initialize the library.
3. Define the routes inside routers.
4. Modify/Add your navigation links.

### Install the package

```bash
npm i @wjfe/n-savant
```

### Initialize the Library

```typescript
// In your main.ts, or somewhere BEFORE any routers are created:
import { init } from "@wjfe/n-savant";

// Default:  Lite mode, implicit path routing, no router hierarchy tracing, single hash mode.
init();

// If all you care about is (traditional) hash routing, the recommendation is to change the implicit mode:
init({ implicitMode: 'hash' });
```

### Define the Routes

`<Route>`s are added inside `<Router>`s.  `<Router>`s can be nested inside other `<Router>`s.  `<Route>`s can render 
`<Router>`s or other `<Route>`s, etc.  You get the idea:  You do as you wish.

```svelte
<script lang="ts">
    import { Router, Route } from "@wjfe/n-savant";
    import NavBar from "./lib/NavBar.svelte";
    import UserView from "./lib/UserView.svelte";
</script>

<Route>
    <NavBar />
    <div class="container">
        <Router>
            <!-- content outside routes is always rendered -->
            <h1>Routing Demo</h1>
            <Route key="users" path="/users">
                <!-- content here -->
            </Route>
            <Route key="user" path="/users/:userId">
                <!-- access parameters via the snippet parameter -->
                {#snippet children(params)}
                    <UserView id={params.userId} /> <!-- Intellisense will work here!! -->
                {/snippet}
            </Route>
            ...
        </Router>
    </div>
</Route>
```

### Navigation Links

The previous step added the `<NavBar />` component inside the router.  This is the best practice for full `<Link>` 
functionality.  Still, this is not mandatory.

```svelte
<!-- NavBar.svelte -->
<script lang="ts">
    import { Link } from "@wjfe/n-savant";
</script>

<nav>
    <div class="nav-links">
        <ul>
            <li class="nav-link">
                <Link href="/users" activeState={{ key: 'users', class: 'active' }}>All Users</Link>
            </li>
            ...
        </ul>
    </div>
</nav>
```

## Micro-Frontend Goodness

This router's implementation intends to cater for micro-frontends as best as possible.  The following are features and 
strategies that are possible with this router.

### Multi-Route Matching

Routers always evaluate all defined routes, so it is possible for more than one route to match.  This facilitates the 
layout of micro-frontends.  For example, a navigation micro-frontend could be inside a route that either always matches 
or matches most of the time, so navigation links are available the mayority/all of the time.

### Simultaneous, Always-On Path and Hash Routing

Components (`Router`, `Route`, `Link`, `Fallback` and `RouterTrace`) with the same value of the `hash` property belong 
to the same "universe".  Components with different hash values belong to different universes, and these universes are 
parallel universes.  Components with hash value `false` use the URL's path name and will never interfere with routers 
that use hash routing (hash value `true` or a path's name).  The main micro-frontend(s) may route using the URL's path 
name, while specialty MFE's could route using the path in the hash part of the URL.

### Multi-Hash Routing

As of Februrary 2025, no other router in the world can do this.

Imagine a scenario where your MFE application would like to show side-by-side two micro-frontends that are 
router-enabled (meaning they use or need to work with a path).  With traditional routing, you could not have this setup 
because one MFE would take over the path, leaving the other MFE without one.

Mutli-hash routing creates named paths in the hash value, giving routers the ability to share the hash value with other 
routers.  A hash value of the form `#path1=/path/1;path2=/path/2;...` could power side-by-side MFE's on, say, 4K 
layouts.

### EXPERIMENTAL - Replacing the `single-spa` Router

It is the author's intent to implement micro-frontends with only `single-spa` parcels and this router.  In other words, 
abandon the use of `registerApplication()` and `start()` and just mount parcels using this router.

[single-spa](https://single-spa.js.org)

## Unintrusive Philosophy

This mini router library imposes minimal restrictions.  Here are some features provided by other much larger codebases 
that are not provided here because Svelte already has the capability.

### Transitions

Nothing prevents you to add transitions to anything.

```svelte
<Route key="users" path="/users/:userId">
    {#snippet children(params)}
        <div transition:fade>
            ...
        </div>
    {/snippet}
</Route>
```

> [!NOTE]
> This one item might be worthwhile revisting for the cases where synchronized transitions are desired.  This, however, 
> won't be looked at until Svelte attachments become a thing.

### Guarded Routes

Guard routes however you wish.  Maybe with an `{#if}` block, or maybe using the route's `and` property that allows you 
to specify a predicate function.  There are probably many other ways.

### `Exact` Property on Routes

Not needed.  All matching is exact path matching, and if you want to opt out of the exact route matching, simply add 
the `rest` parameter specifier (`/*`):

```svelte
<Route key="admin" path="/admin/*">
    ...
</Route>
```

Now route matching for this route will behave as "starts with".  If you don't care about the value of the parameter, 
just ignore it.

### Lazy-Loading

Lazy-loading components is very simple:

```svelte
<script lang="ts">
    function loadUsersComponent() {
        return import('./lib/Users.svelte').then(m => m.default);
    }
</script>

<Route key="users" path="/users">
    {#await loadUsersComponent()}
        <span>Loading...</span>
    {:then Users}
        <Users />
    {:catch}
        <p>Ooops!</p>
    {/await}
</Route>
```

### Navigation Events

There are no navigation events defined.  Simply write effects or derived computations based on the global `location` 
object's `url`, `state` or `hashPaths` properties, which are reactive.

```typescript
import { location } from "@wjfe/n-savant";

// Or $derived, whichever you need.
$effect(() => {
    // Read location.url to re-run on URL changes (navigation).
    location.url;
    // Read location.state to re-run on state changes.
    location.state;
    // Read location.hashPaths to re-run on hash changes (hash navigation).
    // The route named "single" is the one you want if doing hash routing.
    location.hashPaths.single;
});
```

### Parameter Types

There is no parameter type specification.  All parameter values go through type parsing:

+ If the value represents a number, then the parameter value will be a `number`.
+ If the value is the word `'true'` or `'false'`, then the parameter value will be a `boolean`.
+ If none of the above, the value will be a `string`.

If the demand for parameter value types grow, this might be reconsidered, but know that this is easily achievable with 
the `and` property on routes, or by specifying the path as a regular expression.

In the context of the following code, the path `'/users/summary'` would match both routes, so the one that needs a 
numeric parameter value uses the `and` property to type-check the value:

```svelte
<Route path="/users/:userId" and={(rp) => typeof rp.userId === 'number'}>
    {#snippet children(rp)}
        <UserDetails userId={rp.userId} />
    {/snippet}
</Route>
<Route path="/users/summary">
    <UsersSummary />
</Route>
```

This is the version using a regular expression for the `path` property:

```svelte
<Route path={/\/users\/(?<userId>\d+)/i}>
    {#snippet children(rp)}
        <UserDetails userId={rp.userId} />
    {/snippet}
</Route>
<Route path="/users/summary">
    <UsersSummary />
</Route>
```

### Reacting to Route Matching Events

If you're interested in reacting whenever (a) particular route(~~s~~) match(es), you can get a hold of the `routeStatus` 
property of router engines (which is reactive) by binding to a router's `router` property:

```svelte
<script lang="ts">
    import { RouterEngine } from "@wjfe/n-savant/core";

    let router: $state<RouterEngine>();

    $effect(() => {
        for (let [key, rs] of Object.entries(router.routeStatus)) {
            // key: Route's key
            // rs:  RouteStatus for the route.
            if (rs.match) {
                // Do stuff with rs.routeParams, for example.
            }
        }
    });
</script>

<Router bind:router>
    ...
</Router>
```

## Navigation

The recommended way of navigating is to create `<Link>` component instances to render links on the document(s).  If 
needed, however, there's a programmatic way of navigating:  `location.navigate()`.

```typescript
import { location } from "@wjfe/n-savant";

// Path routing navigation:
location.navigate('/new/path', { replace: true, state: { custom: 'Hi' }});

// Hash routing navigation:
location.navigate('#/new/path', { replace: true, state: { custom: 'Hi' }});

// Multi-hash routing navigation:
location.navigate('/new/path', 'path1', { replace: true, state: { custom: 'Hi' }});
```

Navigation in multi-hash scenarios is tricky:  One must make sure other paths remain untouched, and the information 
about these other paths is stored in `location.hashPaths`.  You could use the second form above for multi-hash routing 
as long as you understand that it is your responsibility to (possibly) ensure the integrity of other paths defined in 
the URL's hash value.

Just in case you are wondering:  The navigation logic is already there in `<Link>` components:

```svelte
<!-- Path Routing => https://example.com/new/path -->
<Link hash="false" href="/new/path">Click Me!</Link>

<!-- Hash Routing => https://example.com/#/new/path -->
<Link hash="true" href="/new/path">Click Me!</Link>

<!-- Multi Hash Routing => https://example.com/#path1=/new/path -->
<!-- Will also preserve any other named paths -->
<Link hash="path1" href="/new/path">Click Me!</Link>
```

> [!IMPORTANT]
> Not setting the `hash` property is **not the same** as setting it to `false`.  When `hash` is `undefined`, either 
> because the property is not specified at all, or its value is set to `undefined` explicitly, the value of the 
> `implicitMode` routing option, which is set when the library is initialized, will be used to resolve a `true` or 
> `false` value.
>
> This is true for all components.

## Playing with Fire

At your own risk, you could use exported API like `getRouterContext()` and `setRouterContext()` to perform unholy acts 
on the router layouts, again, **at your own risk**.

---

[Full Documentation @ Hashnode Space](https://wjfe-n-savant.hashnode.space)

If you would like to report a bug or request a feature, head to the [Issues page](https://github.com/WJSoftware/wjfe-n-savant/issues).
