<script lang="ts">
	import { Link, Route } from '@wjfe/n-savant';
	import SubNav from './SubNav.svelte';
	import { routingMode } from './hash-routing';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		...restProps
	}: HTMLAttributes<HTMLElement> = $props();

	const pathRoutingLinks = [
		{ text: 'Home', href: '/path-routing' },
		{ text: 'Start Demo', href: '/path-routing/demo' }
	];
	const hashRoutingLinks = [
		{ text: 'Home', href: '/hash-routing' },
		{
			text: 'Start Demo',
			href: '/hash-routing#' + (routingMode === 'multi' ? 'd1=/demo;d2=/demo' : '/demo')
		}
	];
</script>

<nav class="navbar navbar-expand-lg bg-primary-subtle" {...restProps}>
	<div class="container-fluid">
		<Link class="navbar-brand fw-bold" href="/" id="logoLink">
			<svg style:height="1.7em" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
				<!-- Outer circle -->
				<circle cx="50" cy="50" r="48" stroke="black" stroke-width="2" fill="none" />
				<!-- Compass needle -->
				<polygon points="50,5 55,50 50,95 45,50" fill="red" transform="rotate(15, 50, 50)" />
				<!-- North indicator -->
				<text x="50" y="12" font-family="Arial" font-size="18" text-anchor="middle" fill="black"
					>N</text
				>
				<!-- East indicator -->
				<text x="88" y="55" font-family="Arial" font-size="18" text-anchor="middle" fill="black"
					>E</text
				>
				<!-- South indicator -->
				<text x="50" y="98" font-family="Arial" font-size="18" text-anchor="middle" fill="black"
					>S</text
				>
				<!-- West indicator -->
				<text x="12" y="55" font-family="Arial" font-size="18" text-anchor="middle" fill="black"
					>W</text
				>
			</svg>
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
					<Link class="nav-link" activeState={{ class: 'active', key: 'home' }} href="/" id="homeLink">Home</Link>
				</li>
				<Route key="homeMenuPr" when={(rs) => !rs.pathRouting?.match}>
					<li class="nav-item">
						<Link
							class="nav-link"
							activeState={{ class: 'active', key: 'pathRouting' }}
							href="/path-routing"
						>
							Path Routing
						</Link>
					</li>
				</Route>
				<Route key="pathRouting">
					<SubNav title="Path Routing" links={pathRoutingLinks} />
				</Route>
				<Route key="homeMenuHr" when={(rs) => !rs.hashRouting?.match}>
					<li class="nav-item">
						<Link
							class="nav-link"
							activeState={{ class: 'active', key: 'hashRouting' }}
							href="/hash-routing"
						>
							Hash Routing
						</Link>
					</li>
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
