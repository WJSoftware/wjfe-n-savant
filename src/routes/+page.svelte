<script lang="ts">
    import Router from "$lib/Router/Router.svelte";
    import Route from "$lib/Route/Route.svelte";
	import RouterTrace from "$lib/RouterTrace/RouterTrace.svelte";
	import { RouterEngine } from "$lib/core/RouterEngine.svelte.js";

    const x = new RouterEngine();
</script>
<h1>Welcome to your library project</h1>
<Router>
    <Route key="home" path="/">
        <h2>Home</h2>
    </Route>
    <Route key="about" path="/about">
        <h2>About</h2>
    </Route>
    <Route key="contact" path="/contact">
        <h2>Contact</h2>
    </Route>
    <Route key="page" path="/:page/:id?/*">
        {#snippet children(params)}
            <h2>{params?.page}</h2>
        {/snippet}
    </Route>
    <RouterTrace hash router={x} />
</Router>
