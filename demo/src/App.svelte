<script lang="ts">
	import './app.scss';
	import NavBar from './lib/NavBar.svelte';
	import Tooltip from './lib/Tooltip.svelte';
	import { Router, Route, Fallback, RouterTrace, activeBehavior } from '@svelte-router/core';
	import NotFound from './lib/NotFound.svelte';
	import HomeView from './lib/views/home/HomeView.svelte';
	import PathRoutingView from './lib/views/path-routing/PathRoutingView.svelte';
	import HashRoutingView from './lib/views/hash-routing/HashRoutingView.svelte';

	let showNavTooltip = $state(false);

	// Show tooltip after a short delay when app loads
	$effect(() => {
		const timer = setTimeout(() => {
			showNavTooltip = true;
		}, 2000);

		// Hide tooltip after 10 seconds or when user interacts
		const hideTimer = setTimeout(() => {
			showNavTooltip = false;
		}, 12000);

		return () => {
			clearTimeout(timer);
			clearTimeout(hideTimer);
		};
	});
</script>

<div class="app">
	<div class="d-flex flex-column h-100">
		<Router id="root">
			{#snippet children(_, rs)}
				<header>
					<Tooltip shown={showNavTooltip} placement="bottom">
						{#snippet reference(ref)}
							<NavBar {@attach ref} />
						{/snippet}
						Use these navigation links to test-drive the routing capabilities of @svelte-router/core.
					</Tooltip>
					<div class="breadcrumb">
						<span>
							<span {@attach activeBehavior(rs, { key: 'home', class: 'bc-active' })}>Home</span>
						</span>
						<span>
							<span {@attach activeBehavior(rs, { key: 'pathRouting', class: 'bc-active' })}
								>Path Routing</span
							>
						</span>
						<span>
							<span {@attach activeBehavior(rs, { key: 'hashRouting', class: 'bc-active' })}
								>Hash Routing</span
							>
						</span>
					</div>
				</header>
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
				{#if !rs.home.match}
					<RouterTrace />
				{/if}
			{/snippet}
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
	.breadcrumb {
		padding: 0.5em 1em;
		background-color: #f8f9fa;
		border-bottom: 1px solid #dee2e6;
		font-size: 0.9em;
		display: flex;
		flex-direction: row;
		gap: 0.5em;
		& > *:after {
			content: '>';
			flex-grow: 1;
			margin-left: 0.5em;
		}
		& > *:last-child:after {
			content: '';
			flex-grow: 0;
			margin-left: 0;
		}
	}
	:global .bc-active {
		font-weight: bold;
		text-decoration: underline;
	}
</style>
