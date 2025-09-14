<script lang="ts">
	import { Link, Route } from '@wjfe/n-savant';
	import logo from '@wjfe/n-savant/logo64';
	import SubNav from './SubNav.svelte';
	import { routingMode } from './hash-routing';
	import type { HTMLAttributes } from 'svelte/elements';

	let { ...restProps }: HTMLAttributes<HTMLElement> = $props();

	const pathRoutingLinks = [
		{ text: 'Home', href: '/path-routing' },
		{ text: 'Start Demo', href: '/path-routing/demo' }
	];
	const hashRoutingLinks = [
		{ text: 'Home', href: '/hash-routing' },
		{
			text: 'Start Demo',
			href: `#${(routingMode === 'multi' ? 'd1=/demo;d2=/demo' : '/demo')}`
		}
	];
</script>

<nav class="navbar navbar-expand-lg bg-primary-subtle" {...restProps}>
	<div class="container-fluid">
		<Link class="navbar-brand fw-bold" href="/" id="logoLink">
			<img src={logo} alt="N-Savant Compass Logo" style:height="1.7em" />
			@wjfe/n-savant
		</Link>
		<button
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#navbarNav"
			aria-controls="navbarNav"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon"></span>
		</button>
		<div class="collapse navbar-collapse" id="navbarNav">
			<ul class="navbar-nav">
				<li class="nav-item">
					<Link
						class="nav-link"
						activeState={{ class: 'active', key: 'home' }}
						href="/"
						id="homeLink">Home</Link
					>
				</li>
				<Route key="homeMenuPr">
					{#snippet children(rp, _, rs)}
						{#if !rs.pathRouting?.match}
							<li class="nav-item">
								<Link
									class="nav-link"
									activeState={{ class: 'active', key: 'pathRouting' }}
									href="/path-routing"
								>
									Path Routing
								</Link>
							</li>
						{/if}
					{/snippet}
				</Route>
				<Route key="pathRouting">
					<SubNav title="Path Routing" links={pathRoutingLinks} />
				</Route>
				<Route key="homeMenuHr">
					{#snippet children(rp, _, rs)}
						{#if !rs.hashRouting?.match}
							<li class="nav-item">
								<Link
									class="nav-link"
									activeState={{ class: 'active', key: 'hashRouting' }}
									href="/hash-routing"
								>
									Hash Routing
								</Link>
							</li>
						{/if}
					{/snippet}
				</Route>
				<Route key="hashRouting">
					<SubNav title="Hash Routing" links={hashRoutingLinks} />
				</Route>
				<li class="nav-item">
					<Link class="nav-link" activeState={{ class: 'active', key: 'px' }} href="/pricing">
						404
					</Link>
				</li>
				<li class="nav-item">
					<Link class="nav-link disabled" href="/disabled" tabindex={-1} aria-disabled="true">
						Disabled
					</Link>
				</li>
			</ul>
		</div>
	</div>
</nav>
