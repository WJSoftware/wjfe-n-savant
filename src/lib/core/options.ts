/**
 * Library's routing options.
 */
export type RoutingOptions = {
    /**
     * Whether to use a single or multiple hash mode.  In single hash mode, the hash value is always one path; in multi 
     * mode, the hash value can be multiple paths.
     * 
     * The multiple paths option shapes the hash value as:  `'#id1=/path/of/id1;id2=/path/of/id2;...'`.
     * 
     * @default 'single'
     */
    hashMode?: 'single' | 'multi';
    /**
     * Mode routers operate when their `hash` property is not set (left `undefined`).
     * 
     * In short:  It tells the library what type of routing is assumed when no `hash` property is specified in `Router`, 
     * `Route`, `Fallback`, `Link`, or `RouterTrace` components.
     * 
     * When set to `'path'`, create components for hash routing by setting the `hash` property to `true` or a string 
     * identifier; when set to `'hash'`, create components for path routing by setting the `hash` property to `false`.
     * 
     * @default 'path'
     * 
     * @example
     * ```svelte
     * // In main.ts:
     * init({ implicitMode: 'hash' });
     * 
     * // In App.svelte:
     * <Router>
     *    <Route path="/path1">
     *        <View1 />
     *    </Route>
     * </Router>
     * ```
     * 
     * Even though the `hash` property is not set in the `Router` or `Route` components, the library will treat both 
     * as hash-routing components because the `implicitMode` option was set to `'hash'`.
     */
    implicitMode?: 'hash' | 'path';
} & ({
    /**
     * Whether to initialize the routing library with all features.
     * @default false
     */
    full?: true;
} | {
    /**
     * Whether to initialize the routing library with all features.
     * @default false
     */
    full: false;
    /**
     * Whether to route in memory only.  This means that the routing library will not modify the browser's history or 
     * URL, but to every API in the library, it will look like that.
     */
    routeInMemory?: boolean;
})

/**
 * Global routing options.
 */
export const routingOptions: Required<RoutingOptions> = {
    full: false,
    hashMode: 'single',
    implicitMode: 'path',
    routeInMemory: false
};
