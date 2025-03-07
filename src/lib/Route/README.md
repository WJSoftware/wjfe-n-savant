# Route

The `Route` component is used to define a route within a `Router` component. It matches the current URL against its 
path and renders its children if the path matches.

`Route` components do not require any special placement.  They can be immediate children of `Router` components, or 
they can be embedded anywhere down the hierarchy, including being children of other `Route` components.

## Props

| Property | Type | Default Value | Bindable | Description |
|-|-|-|-|-|
| `key` | `string` | (none) | | Sets the route's unique key. |
| `path` | `string \| RegExp` | (none) | | Sets the route's path pattern, or a regular expression used to test and match the browser's URL. |
| `and` | `(params: Record<RouteParameters<T>, ParameterValue> \| undefined) => boolean` | `undefined` | | Sets a function for additional matching conditions. |
| `when` | `(routeStatus: Record<string, RouteStatus>) => boolean` | `undefined` | | Sets a function for additional matching conditions. |
| `caseSensitive` | `boolean` | `false` | | Sets whether the route's path pattern should be matched case-sensitively. |
| `hash` | `boolean \| string` | `undefined` | | Sets the hash mode of the route. |
| `params` | `Record<RouteParameters<T>, ParameterValue>` | `undefined` | Yes | Provides a way to obtain a route's parameters through property binding. |
| `children` | `Snippet<[Record<RouteParameters<T>, ParameterValue> \| undefined, any, Record<string, RouteStatus>]>` | `undefined` | | Renders the children of the route. |

[Online Documentation](https://wjfe-n-savant.hashnode.space/wjfe-n-savant/components/route)

## Examples

See the examples for the `Router` component.
