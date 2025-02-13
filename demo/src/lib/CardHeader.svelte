<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

    type Props = HTMLAttributes<HTMLDivElement> & {
        class?: string;
        tag?: string;
    }

    let {
        class: cssClass,
        tag = "div",
        children,
        ...restProps
    }: Props = $props();
</script>

<svelte:element this={tag} class={["card-header", cssClass]} {...restProps}>
    {@render children?.()}
</svelte:element>
