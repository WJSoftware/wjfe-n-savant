import type { PreserveQuery } from "$lib/types.js";
import { location } from "./Location.js";

/**
 * Preserves query parameters from the current URL into the given URL, based on the preservation options.
 * @param url The URL to add preserved query parameters to.
 * @param preserveQuery The query preservation options.
 * @returns The URL with preserved query parameters added.
 */
export function preserveQueryInUrl(url: string, preserveQuery: PreserveQuery): string {
    if (!preserveQuery || !location.url.searchParams.size) {
        return url;
    }

    const urlObj = new URL(url, location.url.origin);
    const existingParams = urlObj.searchParams;
    
    const transferValue = (key: string) => {
        const values = location.url.searchParams.getAll(key);
        if (values.length) {
            values.forEach((v) => existingParams.append(key, v));
        }
    };

    if (preserveQuery === true) {
        // Preserve all current query parameters
        for (let key of location.url.searchParams.keys()) {
            transferValue(key);
        }
    } else if (typeof preserveQuery === 'string') {
        // Preserve a specific query parameter
        transferValue(preserveQuery);
    } else if (Array.isArray(preserveQuery)) {
        // Preserve specific query parameters
        for (let key of preserveQuery) {
            transferValue(key);
        }
    }

    return urlObj.toString();
}

/**
 * Internal helper to merge query parameters for calculateHref.
 * This handles the URLSearchParams merging logic without URL reconstruction.
 * @param existingParams Existing URLSearchParams from the new URL.
 * @param preserveQuery The query preservation options.
 * @returns The merged URLSearchParams or undefined if no merging is needed.
 */
export function mergeQueryParams(existingParams: URLSearchParams | undefined, preserveQuery: PreserveQuery): URLSearchParams | undefined {
    if (!preserveQuery || !location.url.searchParams.size) {
        return existingParams;
    }

    if (!existingParams && preserveQuery === true) {
        return location.url.searchParams;
    }

    const mergedParams = existingParams ?? new URLSearchParams();
    
    const transferValue = (key: string) => {
        const values = location.url.searchParams.getAll(key);
        if (values.length) {
            values.forEach((v) => mergedParams.append(key, v));
        }
    };

    if (typeof preserveQuery === 'string') {
        transferValue(preserveQuery);
    } else {
        for (let key of (Array.isArray(preserveQuery) ? preserveQuery : location.url.searchParams.keys())) {
            transferValue(key);
        }
    }

    return mergedParams;
}
