<script lang="ts">
	import { Link } from '@wjfe/n-savant';

	type Props = {
		hash?: boolean | string;
	};

	let { hash }: Props = $props();
</script>

<nav class="navbar navbar-expand-md bg-warning-subtle">
	<div class="container-fluid">
		<h3 class="navbar-brand"><strong>DEMO:</strong>&nbsp;Library Features</h3>
		<button
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#demonavbar"
			aria-controls="demonavbar"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon"></span>
		</button>
		<div class="navbar-collapse collapse">
			<ul class="navbar-nav" id="demonavbar">
				<li class="nav-item">
					<Link
						{hash}
						activeState={{ class: 'active', key: 'router', ariaCurrent: 'step' }}
						class="nav-link"
						href="/router"
						prependBasePath>Router</Link
					>
				</li>
				<li class="nav-item">
					<Link
						{hash}
						activeState={{ class: 'active', key: 'route', ariaCurrent: 'step' }}
						class="nav-link"
						href="/route"
						prependBasePath>Route</Link
					>
				</li>
				<li class="nav-item">
					<Link
						{hash}
						activeState={{ class: 'active', key: 'link', ariaCurrent: 'step' }}
						class="nav-link"
						href="/link"
						prependBasePath>Link</Link
					>
				</li>
				<li class="nav-item">
					<Link
						{hash}
						activeState={{ class: 'active', key: 'location', ariaCurrent: 'step' }}
						class="nav-link"
						href="/location"
						prependBasePath>location</Link
					>
				</li>
				<li class="nav-item">
					<Link
						{hash}
						activeState={{ class: 'active', key: 'routerEngine', ariaCurrent: 'step' }}
						class="nav-link"
						href="/router-engine"
						prependBasePath>Router Engine</Link
					>
				</li>
				<li class="nav-item">
					<Link
						{hash}
						activeState={{ class: 'active', key: 'api', ariaCurrent: 'step' }}
						class="nav-link"
						href="/api"
						prependBasePath>API</Link
					>
				</li>
			</ul>
		</div>
	</div>
</nav>
