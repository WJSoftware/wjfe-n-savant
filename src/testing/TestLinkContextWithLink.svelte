<script lang="ts">
    import LinkContext from "../lib/LinkContext/LinkContext.svelte";
    import Link from "../lib/Link/Link.svelte";
    import type { Snippet } from "svelte";
    
    interface Props {
        replace?: boolean;
        prependBasePath?: boolean;
        preserveQuery?: string[] | string | boolean;
        linkHref?: string;
        linkText?: string;
        children?: Snippet;
        hash?: boolean | string;
    }
    
    let { 
        replace,
        prependBasePath,
        preserveQuery,
        linkHref = "/test",
        linkText = "Test Link",
        children,
        hash
    }: Props = $props();
</script>

<LinkContext
    {replace}
    {prependBasePath}
    {preserveQuery}
>
    <div data-testid="link-container">
        <Link href={linkHref} {hash}>{linkText}</Link>
    </div>
    {#if children}
        {@render children()}
    {/if}
</LinkContext>
