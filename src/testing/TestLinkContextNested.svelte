<script lang="ts">
    import LinkContext from "../lib/LinkContext/LinkContext.svelte";
    import type { Snippet } from "svelte";
    
    interface Props {
        parentReplace?: boolean;
        parentPrependBasePath?: boolean;
        parentPreserveQuery?: string[] | string | boolean;
        childReplace?: boolean;
        childPrependBasePath?: boolean;
        childPreserveQuery?: string[] | string | boolean;
        children?: Snippet;
    }
    
    let { 
        parentReplace,
        parentPrependBasePath,
        parentPreserveQuery,
        childReplace,
        childPrependBasePath,
        childPreserveQuery,
        children 
    }: Props = $props();
</script>

<LinkContext
    replace={parentReplace}
    prependBasePath={parentPrependBasePath}
    preserveQuery={parentPreserveQuery}
>
    <LinkContext
        replace={childReplace}
        prependBasePath={childPrependBasePath}
        preserveQuery={childPreserveQuery}
    >
        {#if children}
            {@render children()}
        {:else}
            <div data-testid="nested-content">Nested Context Test</div>
        {/if}
    </LinkContext>
</LinkContext>
