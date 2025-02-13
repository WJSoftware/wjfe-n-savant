<script lang="ts">
	import { RouterTrace } from '@wjfe/n-savant';
	import type { Snippet } from 'svelte';

    type Props = {
        tag?: string;
        hash?: boolean | string;
        children?: Snippet;
        [x: string]: any;
    };

    let {
        tag = 'div',
        hash,
        children,
        class: cssClass,
        ...restProps
    }: Props = $props();
</script>

<svelte:element this={tag} class={["flex-fill overflow-auto", cssClass]} {...restProps}>
    {@render children?.()}
</svelte:element>
<RouterTrace {hash} />
