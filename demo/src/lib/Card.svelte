<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

    type Props = HTMLAttributes<HTMLDivElement> & {
        class?: string;
    }

    let {
        class: cssClass,
        children,
        ...restProps
    }: Props = $props();
</script>

<div class={["card", cssClass]} {...restProps}>
    {@render children?.()}
</div>
