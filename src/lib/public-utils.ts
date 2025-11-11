import { RouterEngine } from "./kernel/RouterEngine.svelte.js";
import type { RouteStatus } from "./types.js";

/**
 * Checks if a specific route is active according to the provided router engine or route status record.
 *
 * **Note:** `false` is also returned if no router engine is provided or if no route key is specified.
 * @param rsOrRouter A router engine or a router engine's route status record.
 * @param key The route key to check for activity.
 * @returns `true` if the specified route is active; otherwise, `false`.
 */
export function isRouteActive(
    rsOrRouter: RouterEngine | Record<string, RouteStatus> | null | undefined,
    key: string | null | undefined
): boolean {
    const rs = rsOrRouter instanceof RouterEngine ? rsOrRouter.routeStatus : rsOrRouter;
    return !!rs?.[key ?? '']?.match;
}
