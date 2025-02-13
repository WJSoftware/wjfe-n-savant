<script lang="ts">
    import { location } from '@wjfe/n-savant';
</script>

<dl>
    {#each Object.entries(location.hashPaths) as [id, path]}
        <dt>{id}</dt>
        <dd>{path}</dd>
    {/each}
</dl>
