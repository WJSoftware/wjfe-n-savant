<script lang="ts">
    import LinkContext, { type ILinkContext } from "../lib/LinkContext/LinkContext.svelte";
	import LinkContextSpy from "./LinkContextSpy.svelte";
    
    interface Props extends ILinkContext {
        linkCtx?: ILinkContext;
    }
    
    let {
        linkCtx = $bindable(),
        ...restProps
    }: Props = $props();
</script>

<LinkContext {...restProps}>
    <LinkContextSpy bind:linkCtx />
</LinkContext>
