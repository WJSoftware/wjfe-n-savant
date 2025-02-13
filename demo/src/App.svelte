<script lang="ts">
	import './app.scss';
	import NavBar from './lib/NavBar.svelte';
	import { Router, Route, Fallback, RouterTrace } from '@wjfe/n-savant';
	import NotFound from './lib/NotFound.svelte';
	import HomeView from './lib/views/home/HomeView.svelte';
	import PathRoutingView from './lib/views/path-routing/PathRoutingView.svelte';
	import HashRoutingView from './lib/views/hash-routing/HashRoutingView.svelte';
</script>

<svelte:head>
	<script src="node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
</svelte:head>

<div class="app">
	<div class="d-flex flex-column h-100">
		<Router id="root">
			<NavBar />
			<main class="d-flex flex-column flex-fill overflow-auto mt-3">
				<div class="container-fluid flex-fill d-flex flex-column">
					<div class="grid flex-fill">
						<Route key="home" path="/">
							<HomeView />
						</Route>
						<Route key="pathRouting" path="/path-routing/*">
							<PathRoutingView basePath="/path-routing" />
						</Route>
						<Route key="hashRouting" path="/hash-routing">
							<HashRoutingView basePath="/hash-routing" />
						</Route>
						<Fallback>
							<NotFound />
						</Fallback>
					</div>
				</div>
			</main>
			<Route key="notHome" when={(rs) => !rs.home.match}>
				<RouterTrace />
			</Route>
		</Router>
	</div>
</div>

<style>
	.app {
		height: 100vh;
	}

	.grid {
		display: grid;
		& > :global(*) {
			grid-area: 1/1/2/2;
		}
	}

	:global {
		.trace-bottom {
			--bg-color: rgba(255, 255, 255, 0.7);
			position: fixed;
			bottom: 0;
			width: 100%;
			background-color: var(--bg-color);
			z-index: 1000;

			& caption {
				background-color: var(--bg-color);
			}
		}
	}
</style>
