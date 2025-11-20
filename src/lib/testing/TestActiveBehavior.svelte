<script lang="ts">
    import { activeBehavior } from "$lib/behaviors/active.svelte.js";
	import type { ActiveState, RouteStatus } from "$lib/types.js";

    type Props = {
        routeStatus: Record<string, RouteStatus>;
        key: string;
        activeState?: ActiveState;
        style?: string;
    };

    let {
        routeStatus,
        key,
        activeState,
        style,
    }: Props = $props();
</script>

<span data-testid="subject" {@attach activeBehavior(routeStatus, { key, ...activeState }, style)}>
    Content
</span>
