const hrefRegex = /^([^#?]*)?(?:\?([^#]*))?(?:#(.*))?$/;

/**
 * Dissects the given hrefs into its parts, namely the paths, hashes, and search parameters.
 * 
 * Hrefs are expected to be in the form of `path?search#hash`.  Hrefs that are falsy will produce empty strings for all 
 * parts.
 * 
 * The index of the parts in the returned arrays correspond to the index of the hrefs in the given array.
 * @param hrefs The hrefs to parse and dissect into its parts.
 * @returns A record containing the paths, hashes, and search parameters of the hrefs.
 */
export function dissectHrefs(...hrefs: (string | undefined)[]): Record<'paths' | 'hashes' | 'searchParams', string[]> {
    const paths: string[] = [];
    const hashes: string[] = [];
    const searchParams: string[] = [];
    for (let i = 0; i < hrefs.length; ++i) {
        if (!hrefs[i]) {
            paths.push('');
            searchParams.push('');
            hashes.push('');
            continue;
        }
        const match = hrefs[i]!.match(hrefRegex);
        paths.push(match![1] || '');
        searchParams.push(match![2] || '');
        hashes.push(match![3] || '');
    }
    return {
        paths,
        searchParams,
        hashes,
    };
}
