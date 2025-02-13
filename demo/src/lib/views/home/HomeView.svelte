<script lang="ts">
	import { fade } from 'svelte/transition';
	import Hero from './Hero.svelte';
	import Quickstart from './Quickstart.svelte';
	import { RouterTrace } from '@wjfe/n-savant';
</script>

<div class="root" transition:fade={{ duration: 500 }}>
	<Hero />
	<div class="row mt-5">
		<div class="col-md-6">
			<h2 class="display-3">Routing Demo</h2>
            <p>
                This is a demo project for the <code>@wjfe/n-savant</code> router for Svelte v5.
                Use the navigation links in the top bar to experience all of the router's features.
            </p>
		</div>
        <div class="col-md-6">
            <Quickstart />
        </div>
	</div>
    <div class="row mt-3">
        <div class="col">
            <div class="card">
                <h3 class="card-header">About the Route Tracer</h3>
                <div class="card-body">
                    <p>
                        The following table will appear throughout the various demo pages once for 
                        each <code>&lt;Router&gt;</code> component in the hierarchy of routers.
                    </p>
                    <RouterTrace />
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .root {
        z-index: 10;
    }
</style>
