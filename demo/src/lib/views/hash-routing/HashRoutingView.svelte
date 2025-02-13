<script lang="ts">
	import DemoView from '../../demo/DemoView.svelte';
	import ViewSkeleton from '../ViewSkeleton.svelte';
	import { routingMode, toggleRoutingMode } from '../../hash-routing.js';
	import { Route, Router } from '@wjfe/n-savant';

	let {
		basePath
	}: {
		basePath?: string;
	} = $props();
</script>

{#snippet demo(hash: boolean | string)}
	<Router {hash} id="hash-demo{typeof hash === 'string' ? `-${hash}` : ''}">
		<ViewSkeleton {hash}>
			<Route {hash} key="demo" path="/demo/*">
				<DemoView basePath="/demo" {hash} />
			</Route>
		</ViewSkeleton>
	</Router>
{/snippet}

<div>
	<h1>Hash Routing</h1>
	<p>
		Hash routing uses the value of the URL's hash to determine the route. This is an always-on
		feature that can coexist with path routing. The hash value is the portion of the URL that
		follows the `#` character.
	</p>
	<div class="row mt-5">
		<div class="col-6">
			<div class="card h-100">
				<h3 class="card-header">Simultaneous Path and Hash Routing</h3>
				<div class="card-body">
					<p>
						The <code>@wjfe/n-savant</code> library allows both modes simultaneously by
						specification of the Boolean <code>hash</code> property in both the
						<code>&lt;Router&gt;</code>
						and <code>&lt;Route&gt;</code> components.
					</p>
					<p>
						The components make sure nothing gets mixed, but if you're consuming the
						<code>RouterEngine</code> class in code, then you must make sure that any router hierarchies
						you build operate in the same mode.
					</p>
				</div>
			</div>
		</div>
		<div class="col-6">
			<div class="card h-100">
				<h3 class="card-header">Single or Multiple Hash Routes</h3>
				<div class="card-body">
					<p>
						The library can operate in single or multiple hash mode. Single mode is what is found
						virtually in any other routing library: The hash's entire value is the route. In
						multiple mode, however, the hash value is interpreted as a semi-colon-separated list of
						key/value pairs.
					</p>
					<p>
						Modes are mutually exclusive since they share the same hash value and it cannot be both
						at the same time (not a Schrödinger hash). The mode is set in the library's
						initialization options.
					</p>
				</div>
			</div>
		</div>
	</div>
	<div class="row mt-5">
		<div class="col-6 offset-3">
			<div class="card">
				<h3 class="card-header">Hash Routing Demo</h3>
				<ul class="list-group list-group-flush">
					<li class="list-group-item">
						<p>
							<span class="fw-bold bg-warning-subtle px-3 py-1 rounded"
								>Current Hash Mode: <code>{routingMode}</code></span
							>
						</p>
						<p>
							Switch modes to see the demo in <code
								>{routingMode === 'single' ? 'multi' : 'single'}</code
							>
							mode. <strong>NOTE:</strong> The page will reload.
						</p>
						<button type="button" class="btn btn-warning" onclick={() => toggleRoutingMode()}>
							Switch Mode
						</button>
					</li>
				</ul>
			</div>
		</div>
	</div>
	{#if routingMode === 'multi'}
		<div class="row g-3">
			<div class="col-xl-6">
				{@render demo('d1')}
			</div>
			<div class="col-xl-6">
				{@render demo('d2')}
			</div>
		</div>
	{:else}
		{@render demo(true)}
	{/if}
</div>
