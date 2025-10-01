<script lang="ts">
    import { getLinkContext, type ILinkContext } from "../lib/LinkContext/LinkContext.svelte";
    
    interface Props {
        linkCtx?: ILinkContext;
    }
    
    let { 
        linkCtx = $bindable(),
    }: Props = $props();

    linkCtx = getLinkContext();
</script>
