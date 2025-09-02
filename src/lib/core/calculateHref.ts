import type { Hash, PreserveQuery } from "$lib/types.js";
import { dissectHrefs } from "./dissectHrefs.js";
import { location } from "./Location.js";
import { mergeQueryParams } from "./preserveQuery.js";
import { joinPaths } from "./RouterEngine.svelte.js";
import { resolveHashValue } from "./resolveHashValue.js";

export type CalculateHrefOptions = {
    /**
     * Whether to preserve the current query parameters (or the ones specified) in the new URL.
     * 
     * New URL's can specify a query string, and if query string preservation is requested, the query parameters from 
     * the current URL will be appended with the ones from the new URL.
     */
    preserveQuery?: PreserveQuery;
    /**
     * Whether to preserve the current hash in the new URL.  This is only applicable when the `hash` property is set to 
     * `false` (path routing universe).
     */
    preserveHash?: boolean;
    /**
     * Determines the routing universe the new URL will be for.
     * 
     * Read the [online documentation](https://wjfe-n-savant.hashnode.space/wjfe-n-savant/routing-modes) to understand 
     * the concept of routing modes (or universes).
     */
    hash?: Hash;
};

function calculateMultiHashHref(hashId: string, newPath: string) {
    let idExists = false;
    let finalUrl = '';
    for (let [id, path] of Object.entries(location.hashPaths)) {
        if (id === hashId) {
            idExists = true;
            path = newPath;
        }
        finalUrl += `;${id}=${path}`;
    }
    if (!idExists) {
        finalUrl += `;${hashId}=${newPath}`;
    }
    return finalUrl.substring(1);
}

/**
 * Combines the given HREF's into a single HREF that also includes any query string parameters that are either carried
 * by the given HREF's, or preserved from the current environment's URL.
 *
 * Calculation is done assuming the resultant HREF will be for the routing universe specified in the library's
 * `implicitMode` option.
 * @param hrefs The HREF's used to calculate the final HREF for the routing universe implied by the library's implicit 
 * mode.
 */
export function calculateHref(...hrefs: (string | undefined)[]): string;
/**
 * Combines the given HREF's into a single HREF that also includes any query string parameters that are either carried
 * by the given HREF's, or preserved from the current environment's URL.
 *
 * Calculation is done assuming the resultant HREF will be for the routing universe specified by the options' `hash` 
 * property.  If the option is not specified, then a value will be resolved based on the library's `implicitMode` 
 * option.
 * @param options Desired options that control how the resultant HREF is calculated.
 * @param hrefs The HREF's used to calculate the final HREF for the desired routing universe.
 */
export function calculateHref(options: CalculateHrefOptions, ...hrefs: (string | undefined)[]): string;
export function calculateHref(...allArgs: (CalculateHrefOptions | string | undefined)[]): string {
    let options = (typeof allArgs[0] === 'object' ? allArgs.shift() : {}) as CalculateHrefOptions;
    let {
        hash = resolveHashValue(undefined),
        preserveQuery = false,
        preserveHash = false
    } = options;
    const allHrefs = allArgs as (string | undefined)[];
    const dissected = dissectHrefs(...allHrefs);
    if (hash !== false && dissected.hashes.some(h => !!h.length)) {
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
    searchParams = mergeQueryParams(searchParams, preserveQuery);
    const path = typeof hash === 'string' ?
        calculateMultiHashHref(hash, joinPaths(...dissected.paths)) :
        joinPaths(...dissected.paths);
    let hashValue = hash === false ?
        dissected.hashes.find(h => h.length) || (preserveHash ? location.url.hash.substring(1) : '') :
        path;
    return `${hash ? '' : path}${searchParams ? `?${searchParams}` : ''}${hashValue.length ? `#${hashValue}` : ''}`;
}
