# LinkContext

The `LinkContext` component is used to create context for `Link` components.  This context can be used to set, in 
mass, the `replace`, `prependBasePath` and `preserveQuery` properties.

Instead of writing this:

```svelte
<Link prependBasePath preserveQuery href="...">...</Link>
<Link prependBasePath preserveQuery href="...">...</Link>
<Link prependBasePath preserveQuery href="...">...</Link>
<Link prependBasePath preserveQuery href="...">...</Link>
```

You can do:

```svelte
<LinkContext prependBasePath preserveQuery>
    <Link href="...">...</Link>
    <Link href="...">...</Link>
    <Link href="...">...</Link>
</LinkContext>
```

Unlike the rest of components in this library, this one does not support the `hash` property.  The context is 
inherited by all links among its children.

**Note**:  The `preserveQuery` option only has an effect on path routing links since hash routing links should not 
lose the query string.

## Priorities

The `Link` component will give priority to an explicitly-set value at its property level.  If a property-level value is 
not found, then the context-provided property value is used.  If there is no context, then the default value takes over.

## Props

| Property | Type | Default Value | Bindable | Description |
|-|-|-|-|-|
| `replace` | `boolean` | `false` | | Configures the link so it replaces the current URL as opposed to pushing the URL as a new entry in the browser's History API. |
| `prependBasePath` | `boolean` | `false` | | Configures the component to prepend the parent router's base path to the `href` property. |
| `preserveQuery` | `PreserveQuery` | `false` | | Configures the component to preserve the query string whenever it triggers navigation. |
| `children` | `Snippet` | `undefined` | | Renders the children of the component. |

[Online Documentation](https://wjfe-n-savant.hashnode.space/wjfe-n-savant/components/linkcontext)
