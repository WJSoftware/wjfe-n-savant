<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
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
        <code><pre>npm install @wjfe/n-savant</pre></code>
        <p>Then, in your Svelte app:</p>
        <code><pre>{`${'<'}script lang="ts">
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
</Router>`}</pre></code>
    </div>
</div>

<!--
@component
# Quickstart
```svelte
<script>
    import Quickstart from './lib/Quickstart.svelte';
</script>
```
-->
