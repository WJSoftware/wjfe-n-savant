<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import CodeSnippet from "../../CodeSnippet.svelte";
    import bash from "svelte-highlight/languages/bash";
    import typescript from "svelte-highlight/languages/typescript";
    
    type Props = HTMLAttributes<HTMLDivElement>;

    let {
        class: cssClass,
        ...restProps
    }: Props = $props();
</script>

<div class={["card", cssClass]} {...restProps}>
    <div class="card-header">
        <h2>Quickstart</h2>
    </div>
    <div class="card-body">
        <p>Install the package:</p>
        <CodeSnippet 
            language={bash} 
            code="npm install @wjfe/n-savant"
            title="Installation"
        />
        <p>Then, in your Svelte app:</p>
        <CodeSnippet 
            language={typescript} 
            code={`<scr` + `ipt lang="ts">
    import { Router, Route } from '@wjfe/n-savant';
    import Hero from './lib/Hero.svelte';
    import Features from './lib/Features.svelte';
</script>

<Router>
    <Route key="home" path="/">
        <Hero />
    </Route>
    <Route key="features" path="/features">
        <Features />
    </Route>
</Router>`}
            title="Basic Usage"
        />
    </div>
</div>
