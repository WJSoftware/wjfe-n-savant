import type { AndUntyped, Hash, PatternRouteInfo, RegexRouteInfo, RouteInfo, RouteStatus } from "../types.js";
import { traceOptions, registerRouter, unregisterRouter } from "./trace.svelte.js";
import { location } from "./Location.js";
import { routingOptions } from "./options.js";
import { resolveHashValue } from "./resolveHashValue.js";

/**
 * RouterEngine's options.
 */
export type RouterEngineOptions = {
    /**
     * The engine's parent router.
     */
    parent?: RouterEngine;
    /**
     * A value that controls hash routing behavior.
     * 
     * If a Boolean is specified, it indicates whether the router uses the URL's hash or pathname 
     * when matching routes; if a string is specified, it indicates the hash routing (same as the 
     * Boolean value `true`), and sets the path ID.
     * 
     * Setting a hash path ID requires that the library had been initialized with the `multi` value 
     * for the `hashMode` option in the `init` function.
     */
    hash?: boolean | string;
}

function isRouterEngine(obj: unknown): obj is RouterEngine {
    return obj instanceof RouterEngine;
}

/**
 * Joins the provided paths into a single path.
 * @param paths Paths to join.
 * @returns The joined path.
 */
export function joinPaths(...paths: string[]) {
    const result = paths.reduce((acc, path, index) => {
        const trimmedPath = (path ?? '').replace(/^\/|\/$/g, '');
        return acc + (index > 0 && !acc.endsWith('/') && trimmedPath.length > 0 ? '/' : '') + trimmedPath;
    }, hasLeadingSlash(paths) ? '/' : '');
    return noTrailingSlash(result);
}

function hasLeadingSlash(paths: (string | undefined)[]) {
    for (let path of paths) {
        if (!path) {
            continue;
        }
        return path.startsWith('/');
    }
    return false;
}

function noTrailingSlash(path: string) {
    return path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path;
}

function routeInfoIsRegexInfo(info: unknown): info is RegexRouteInfo {
    return (info as RegexRouteInfo).regex instanceof RegExp;
}

function escapeRegExp(string: string): string {
    return string.replace(/[.+^${}()|[\]\\]/g, '\\$&');
}

function tryParseValue(value: string) {
    if (value === '' || value === undefined || value === null) {
        return value;
    }
    const num = Number(value);
    if (!isNaN(num)) {
        return num;
    }
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    return value;
}

const identifierRegex = /(\/)?:([a-zA-Z_]\w*)(\?)?/g;
const paramNamePlaceholder = "paramName";
const paramValueRegex = `(?<${paramNamePlaceholder}>[^/]+)`;
const restParamRegex = /\/\*$/;

/**
 * Internal key used to access the route patterns of a router engine.
 */
export const routePatternsKey = Symbol();

/**
 * Router class that fuels the `Router` component.  It is used to define routes and monitor the current URL.
 * 
 * This class can be used in JavaScript code if you prefer routing in JavaScript over routing using the `Router` and 
 * `Route` components.
 */
export class RouterEngine {
    #cleanup = false;
    #parent: RouterEngine | undefined;
    #resolvedHash: Hash;
    #hashId: string | undefined;
    /**
     * Gets or sets the router's identifier.  This is displayed by the `RouterTracer` component.
     */
    id = $state<string>();
    /**
     * Gets or sets a reactive object that contains the route definitions.  The keys are the route names, and the values 
     * are the route definitions.
     * 
     * @default {}
     */
    #routes = $state<Record<string, RouteInfo>>({});
    /**
     * Gets or sets the base path of the router.  This is the part of the URL that is ignored when matching routes.
     * 
     * @default '/'
     */
    #basePath = $state<string>('/');
    /**
     * Calculates the route patterns to be used for matching the current URL.
     * 
     * This is done separately so it is memoized based on the route definitions and the base path only.
     */
    #routePatterns = $derived(Object.entries(this.routes).reduce((map, [key, route]) => {
        map.set(
            key, routeInfoIsRegexInfo(route) ?
            { regex: route.regex, and: route.and, ignoreForFallback: !!route.ignoreForFallback } :
            this.#parseRoutePattern(route)
        );
        return map;
    }, new Map<string, { regex?: RegExp; and?: AndUntyped; ignoreForFallback: boolean; }>()));

    [routePatternsKey]() {
        return this.#routePatterns;
    }

    #testPath = $derived.by(() => noTrailingSlash(this.#hashId ? (location.hashPaths[this.#hashId] || '/') : this.path));

    #routeStatusData = $derived.by(() => {
        const routeStatus = {} as Record<string, RouteStatus>;
        let noMatches = true;
        for (let routeKey of Object.keys(this.routes)) {
            const pattern = this.#routePatterns.get(routeKey)!;
            const matches = pattern.regex ? pattern.regex.exec(this.#testPath) : null;
            const routeParams = matches?.groups ? { ...matches.groups } as RouteStatus['routeParams'] : undefined;
            if (routeParams) {
                for (let key in routeParams) {
                    if (routeParams[key] === undefined) {
                        delete routeParams[key];
                        continue;
                    }
                    routeParams[key] = tryParseValue(decodeURIComponent(routeParams[key] as string));
                }
            }
            const match = (!!matches || !pattern.regex) && (!pattern.and || pattern.and(routeParams));
            noMatches = noMatches && (pattern.ignoreForFallback ? true : !match);
            routeStatus[routeKey] = {
                match,
                routeParams,
            };
        }
        return [routeStatus, noMatches] as const;
    });
    /**
     * Gets a a record of route statuses where the keys are the route keys, and the values are 
     * objects that contain a `match` property and a `routeParams` property.
     */
    routeStatus = $derived(this.#routeStatusData[0]);
    /**
     * Gets a boolean value that indicates whether the current URL matches none of the route 
     * patterns.
     */
    noMatches = $derived(this.#routeStatusData[1]);
    /**
     * Parses the string pattern in the provided route information object into a regular expression.
     * @param routeInfo Pattern route information to parse.
     * @returns An object with the regular expression and the optional predicate function.
     */
    #parseRoutePattern(routeInfo: PatternRouteInfo): { regex?: RegExp; and?: AndUntyped; ignoreForFallback: boolean; } {
        if (!routeInfo.pattern) {
            return {
                and: routeInfo.and,
                ignoreForFallback: !!routeInfo.ignoreForFallback
            }
        }
        const fullPattern = joinPaths(this.basePath, routeInfo.pattern === '/' ? '' : routeInfo.pattern);
        const escapedPattern = escapeRegExp(fullPattern);
        let regexPattern = escapedPattern.replace(identifierRegex, (_match, startingSlash, paramName, optional, offset) => {
            let regex = paramValueRegex.replace(paramNamePlaceholder, paramName);
            return (startingSlash ? `/${optional ? '?' : ''}` : '')
                + (optional ? `(?:${regex})?` : regex);
        });
        regexPattern = regexPattern.replace(restParamRegex, `(?<rest>.*)`);
        return {
            regex: new RegExp(`^${regexPattern}$`, routeInfo.caseSensitive ? undefined : 'i'),
            and: routeInfo.and,
            ignoreForFallback: !!routeInfo.ignoreForFallback
        };
    }
    /**
     * Initializes a new instance of this class with the specified options.
     */
    constructor(options?: RouterEngineOptions);
    /**
     * Initializes a new instance of this class with the specified parent router.
    */
    constructor(parent: RouterEngine);
    constructor(parentOrOpts?: RouterEngine | RouterEngineOptions) {
        if (!location) {
            throw new Error("The routing library hasn't been initialized.  Execute init() before creating routers.");
        }
        if (isRouterEngine(parentOrOpts)) {
            this.#resolvedHash = parentOrOpts.#resolvedHash;
            this.#parent = parentOrOpts;
        }
        else {
            this.#parent = parentOrOpts?.parent;
            this.#resolvedHash = this.#parent && parentOrOpts?.hash === undefined ? this.#parent.#resolvedHash : resolveHashValue(parentOrOpts?.hash);
            if (this.#parent && this.#resolvedHash !== this.#parent.#resolvedHash) {
                throw new Error("The parent router's hash mode must match the child router's hash mode.");
            }
            if (routingOptions.hashMode === 'multi' && this.#resolvedHash && typeof this.#resolvedHash !== 'string') {
                throw new Error("The specified hash value is not valid for the 'multi' hash mode.  Either don't specify a hash for path routing, or correct the hash value.");
            }
            if (routingOptions.hashMode !== 'multi' && typeof this.#resolvedHash === 'string') {
                throw new Error("A hash path ID was given, but is only allowed when the library's hash mode has been set to 'multi'.");
            }
            this.#hashId = typeof this.#resolvedHash === 'string' ?
                this.#resolvedHash :
                (this.#resolvedHash ? 'single' : undefined);
        }
        if (traceOptions.routerHierarchy) {
            registerRouter(this);
            this.#cleanup = true;
        }
    }
    /**
     * Gets the browser's current URL.
     * 
     * This is a shortcut for `location.url`.
     */
    get url() {
        return location.url;
    }
    /**
     * Gets the environment's current path.
     * 
     * This is a sanitized version of `location.url.pathname` that strips out drive letters for the case of Electron in 
     * Windows.  It is highly recommended to always use this path whenever possible.
     */
    get path() {
        const hasDriveLetter = this.url.protocol.startsWith('file:') && this.url.pathname[2] === ':';
        return hasDriveLetter ? this.url.pathname.substring(3) : this.url.pathname;
    }
    /**
     * Gets the browser's current state.
     * 
     * This is a shortcut for `location.state`.
     */
    get state() {
        return location.getState(this.#resolvedHash);
    }
    /**
     * Gets or sets the router's base path.
     * 
     * The base path is the segments of the URL that must be present in order to match a route.
     */
    get basePath() {
        return joinPaths(this.#parent?.basePath || '/', this.#basePath);
    }
    set basePath(value: string) {
        this.#basePath = value || '/';
    }
    /**
     * Gets the route definitions.
     * 
     * Unless you're consuming the `Router` class directly, the routes are automatically populated by the `Route` 
     * components that are inside a `Router` component.
     */
    get routes() {
        return this.#routes;
    }
    /**
     * Gets the parent router, if any.
     */
    get parent() {
        return this.#parent;
    }
    dispose() {
        if (this.#cleanup) {
            unregisterRouter(this);
        }
    }
}
