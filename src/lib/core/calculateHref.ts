import type { Hash, PreserveQuery } from "$lib/types.js";
import { dissectHrefs } from "./dissectHrefs.js";
import { location } from "./Location.js";
import { mergeQueryParams } from "./preserveQuery.js";
import { joinPaths, resolveHashValue } from "./RouterEngine.svelte.js";

export type CalculateHrefOptions = {
    /**
     * Whether to preserve the current query parameters (or the ones specified) in the new URL.
     * 
     * New URL's can specify a query string, and if query string preservation is requested, the query parameters from 
     * the current URL will be appended with the ones from the new URL.
     */
    preserveQuery?: PreserveQuery;
} & ({
    /**
     * Determines the routing universe the new URL will be for.
     * 
     * Read the [online documentation](https://wjfe-n-savant.hashnode.space/wjfe-n-savant/routing-modes) to understand 
     * the concept of routing modes (or universes).
     */
    hash: false;
    /**
     * Whether to preserve the current hash in the new URL.  This is only applicable when the `hash` property is set to 
     * `false` (path routing universe).
     */
    preserveHash?: boolean;
} | {
    /**
     * Determines the routing universe the new URL will be for.
     * 
     * Read the [online documentation](https://wjfe-n-savant.hashnode.space/wjfe-n-savant/routing-modes) to understand 
     * the concept of routing modes (or universes).
     */
    hash: Exclude<Hash, false>;
});

function calculateMultiHashHref(hashId: string, newPath: string) {
    let idExists = false;
    let finalUrl = '';
    for (let [id, path] of Object.entries(location.hashPaths)) {
        if (id === hashId) {
            idExists = true;
            finalUrl += `;${id}=${newPath}`;
            continue;
        }
        finalUrl += `;${id}=${path}`;
    }
    if (!idExists) {
        finalUrl += `;${hashId}=${newPath}`;
    }
    return '#' + finalUrl.substring(1);
}

export function calculateHref(...paths: (string | undefined)[]): string;
export function calculateHref(options: CalculateHrefOptions, ...paths: (string | undefined)[]): string;
export function calculateHref(...allArgs: (CalculateHrefOptions | string | undefined)[]): string {
    const options = (typeof allArgs[0] === 'object' ? allArgs.shift() : { hash: resolveHashValue(undefined) }) as CalculateHrefOptions;
    const paths = allArgs as (string | undefined)[];
    options.preserveQuery ??= false;
    const dissected = dissectHrefs(...paths);
    if (options.hash !== false && dissected.hashes.some(h => !!h.length)) {
        throw new Error("Specifying hashes in HREF's is only allowed for path routing.");
    }
    let searchParams: URLSearchParams | undefined;
    let joinedSearchParams = '';
    for (let i = 0; i < dissected.searchParams.length; ++i) {
        if (dissected.searchParams[i].length) {
            joinedSearchParams += `&${dissected.searchParams[i]}`;
        }
    }
    if (joinedSearchParams.length) {
        searchParams = new URLSearchParams(joinedSearchParams.substring(1));
    }
    searchParams = mergeQueryParams(searchParams, options.preserveQuery);
    const path = typeof options.hash === 'string' ?
        calculateMultiHashHref(options.hash, joinPaths(...dissected.paths)) :
        joinPaths(...dissected.paths);
    let hashTag = options.hash === false ?
        dissected.hashes.find(h => h.length) || ((options.preserveHash ? location.url.hash : '') ?? '') :
        path;
    hashTag = hashTag.length && hashTag[0] !== '#' ? `#${hashTag}` : hashTag;
    return `${options.hash ? '' : path}${searchParams ? `?${searchParams}` : ''}${hashTag.length ? `${hashTag}` : ''}`;
}
