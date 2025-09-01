<script lang="ts">
	import DemoView from '../../demo/DemoView.svelte';
	import ViewSkeleton from '../ViewSkeleton.svelte';
	import CodeSnippet from '../../CodeSnippet.svelte';
	import { routingMode, toggleRoutingMode } from '../../hash-routing.js';
	import { Route, Router, location } from '@wjfe/n-savant';
	import typescript from 'svelte-highlight/languages/typescript';
	import xml from 'svelte-highlight/languages/xml';

	let {
		basePath
	}: {
		basePath?: string;
	} = $props();

	// Modal state
	let showCodeModal = $state(false);

	// Simplified code example for the modal
	const liveHashCode = `<scr` + `ipt lang="ts">
  import { location } from '@wjfe/n-savant';

  // Reactive hash display
  const currentHash = $derived(() => {
    return location.url.hash || '#(empty)';
  });

  // Parse routes for display
  const routes = $derived(() => {
    if (routingMode === 'multi') {
      return location.hashPaths; // All hash paths
    } else {
      return { main: location.hashPaths.single || '' };
    }
  });
</scr` + `ipt>

<div class="hash-display">
  <div class="current-hash">
    Current hash: {currentHash}
  </div>
  
  {#each Object.entries(routes) as [key, value]}
    <div class="route-info">
      <strong>{key}:</strong> {value || '(empty)'}
    </div>
  {/each}
</div>`;

	// Parsed routes for display
	const parsedRoutes = $derived.by(() => {
		if (routingMode === 'multi') {
			// Return all hash paths in multi mode
			return location.hashPaths;
		} else {
			// Return single hash as main route
			return { main: location.hashPaths.single || '' };
		}
	});

	const basicHashRouterCode = `<Router hash id="my-hash-router">
  <Route hash key="home" path="/">
    <HomePage />
  </Route>
  <Route hash key="profile" path="/profile/:userId">
    <ProfilePage />
  </Route>
</Router>`;

	const multiHashRouterCode = `<!-- Multiple hash routers can coexist! -->
<Router hash="sidebar" id="sidebar-router">
  <Route hash="sidebar" key="nav" path="/nav">
    <SidebarNavigation />
  </Route>
</Router>

<Router hash="main" id="main-router">
  <Route hash="main" key="dashboard" path="/dashboard">
    <DashboardView />
  </Route>
</Router>`;

	const hashUrlExamples = `// Single Hash Mode URLs:
// https://example.com#/
// https://example.com#/profile/123
// https://example.com#/settings/account

// Multi Hash Mode URLs:
// https://example.com#sidebar=/nav;main=/dashboard
// https://example.com#d1=/demo/routes;d2=/demo/links
// https://example.com#nav=/home;content=/profile/123;modal=/settings`;

	const pathAndHashCode = `<Router id="main-router">
  <!-- Path routing -->
  <Route key="app" path="/app/*">
    <AppLayout />
  </Route>
</Router>

<Router hash id="modal-router">
  <!-- Hash routing for modals -->
  <Route hash key="login" path="/login">
    <LoginModal />
  </Route>
  <Route hash key="settings" path="/settings">
    <SettingsModal />
  </Route>
</Router>`;
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
	<h1>🚀 Hash Routing</h1>
	<p class="lead">
		Navigate your app using URL fragments! Hash routing uses the portion after the `#` character 
		to determine routes, perfect for client-side navigation that works everywhere.
	</p>

	<!-- Hero Section with Basic Concept -->
	<div class="row mt-4">
		<div class="col-lg-6">
			<div class="card border-primary h-100">
				<div class="card-header bg-primary text-white">
					<h4 class="mb-0">✨ Basic Hash Routing</h4>
				</div>
				<div class="card-body">
					<p>
						Hash routing is perfect for single-page applications. It works without server 
						configuration and plays nicely with static hosting!
					</p>
					<CodeSnippet 
						language={xml} 
						code={basicHashRouterCode} 
						title="Basic Hash Router Setup"
					/>
					<div class="mt-3">
						<small class="text-muted">
							💡 Try changing the URL hash to see routing in action!
						</small>
					</div>
				</div>
			</div>
		</div>
		<div class="col-lg-6">
			<div class="card border-success h-100">
				<div class="card-header bg-success text-white">
					<h4 class="mb-0">🎯 URL Examples</h4>
				</div>
				<div class="card-body">
					<p>See how URLs look in both single and multi-hash modes:</p>
					<CodeSnippet 
						language={typescript} 
						code={hashUrlExamples} 
						title="Hash URL Patterns"
					/>
				</div>
			</div>
		</div>
	</div>

	<!-- Advanced Features -->
	<div class="row mt-4">
		<div class="col-lg-6">
			<div class="card border-warning h-100">
				<div class="card-header bg-warning text-dark">
					<h4 class="mb-0">🔄 Multiple Hash Routers</h4>
				</div>
				<div class="card-body">
					<p>
						Run multiple independent hash routers simultaneously! Each router gets its own 
						namespace in the hash value using key-value pairs.
					</p>
					<CodeSnippet 
						language={xml} 
						code={multiHashRouterCode} 
						title="Multi-Hash Router Example"
					/>
					<div class="alert alert-info mt-3">
						<strong>Cool fact:</strong> Multi-hash mode uses semicolon-separated key/value 
						pairs, so `#sidebar=/nav;main=/dashboard` runs two routers independently!
					</div>
					<div class="alert alert-success mt-2">
						<strong>💡 Pro tip:</strong> Keep your multi-hash path names short to prevent URLs from growing too long!
					</div>
				</div>
			</div>
		</div>
		<div class="col-lg-6">
			<div class="card border-info h-100">
				<div class="card-header bg-info text-white">
					<h4 class="mb-0">🤝 Path + Hash Harmony</h4>
				</div>
				<div class="card-body">
					<p>
						Mix path and hash routing! Use path routing for main navigation and hash 
						routing for modals, tabs, or secondary navigation.
					</p>
					<CodeSnippet 
						language={xml} 
						code={pathAndHashCode} 
						title="Simultaneous Path & Hash Routing"
					/>
					<div class="alert alert-success mt-3">
						<strong>Best practice:</strong> Use path routing for main content and hash 
						routing for overlays and temporary UI states.
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Interactive Demo Section -->
	<div class="row mt-5">
		<div class="col-lg-8 offset-lg-2">
			<div class="card border-dark">
				<div class="card-header bg-dark text-white text-center">
					<h3 class="mb-0">🎮 Interactive Demo</h3>
				</div>
				<div class="card-body text-center">
					<div class="mb-4">
						<span class="badge bg-{routingMode === 'single' ? 'primary' : 'success'} fs-6 px-3 py-2">
							Current Mode: <code class="text-white">{routingMode}</code>
						</span>
					</div>
					<p class="lead">
						Experience the difference between single and multi-hash routing modes!
					</p>
					<p>
						Currently in <strong>{routingMode}</strong> mode. 
						{#if routingMode === 'single'}
							The entire hash value represents one route.
						{:else}
							The hash contains multiple key/value pairs for independent routers.
						{/if}
					</p>
					<button 
						type="button" 
						class="btn btn-lg btn-{routingMode === 'single' ? 'success' : 'primary'}" 
						onclick={() => toggleRoutingMode()}
					>
						🔄 Switch to {routingMode === 'single' ? 'Multi' : 'Single'} Mode
					</button>
					<div class="mt-3">
						<small class="text-muted">
							⚠️ Note: The page will reload to apply the new mode.
						</small>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Live Demo -->
	<div class="mt-5">
		<h2 class="text-center mb-4">🎪 Live Demo</h2>
		{#if routingMode === 'multi'}
			<div class="row g-4">
				<div class="col-xl-6">
					<div class="card">
						<div class="card-header">
							<h5 class="mb-0">🎯 Demo Router "d1"</h5>
							<small class="text-muted">Hash key: d1</small>
						</div>
						<div class="card-body">
							{@render demo('d1')}
						</div>
					</div>
				</div>
				<div class="col-xl-6">
					<div class="card">
						<div class="card-header">
							<h5 class="mb-0">🎪 Demo Router "d2"</h5>
							<small class="text-muted">Hash key: d2</small>
						</div>
						<div class="card-body">
							{@render demo('d2')}
						</div>
					</div>
				</div>
			</div>
			<div class="alert alert-info mt-4">
				<h6>🔍 Live URL Hash</h6>
				<p class="mb-2">
					Watch how the URL hash updates in real-time as you navigate through both demos:
				</p>
				<div class="bg-dark text-light p-2 rounded font-monospace">
					Current hash: <span class="text-warning">{location.url.hash || '#(empty)'}</span>
				</div>
				{#if Object.keys(parsedRoutes).length > 0}
					<div class="mt-2">
						<small><strong>Parsed routes:</strong></small>
						<ul class="mb-0 mt-1">
							{#each Object.entries(parsedRoutes) as [key, value]}
								<li><code>{key}</code>: <span class="text-info">{value || '(empty)'}</span></li>
							{/each}
						</ul>
					</div>
				{/if}
				<div class="mt-3">
					<button 
						type="button" 
						class="btn btn-sm btn-outline-primary"
						onclick={() => showCodeModal = true}
					>
						📋 Show Code
					</button>
				</div>
			</div>
		{:else}
			<div class="card">
				<div class="card-header">
					<h5 class="mb-0">🎯 Single Hash Demo</h5>
					<small class="text-muted">The entire hash represents one route</small>
				</div>
				<div class="card-body">
					{@render demo(true)}
				</div>
			</div>
			<div class="alert alert-info mt-4">
				<h6>🔍 Live URL Hash</h6>
				<p class="mb-2">
					In single mode, the entire hash represents one route:
				</p>
				<div class="bg-dark text-light p-2 rounded font-monospace">
					Current hash: <span class="text-warning">{location.url.hash || '#(empty)'}</span>
				</div>
				{#if parsedRoutes.main}
					<div class="mt-2">
						<small><strong>Current route:</strong> <span class="text-info">{parsedRoutes.main}</span></small>
					</div>
				{/if}
				<div class="mt-3">
					<button 
						type="button" 
						class="btn btn-sm btn-outline-primary"
						onclick={() => showCodeModal = true}
					>
						📋 Show Code
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Code Modal -->
{#if showCodeModal}
	<div class="modal fade show" style="display: block;" tabindex="-1">
		<div class="modal-dialog modal-lg">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">💻 Live Hash Display Code</h5>
					<button 
						type="button" 
						class="btn-close" 
						onclick={() => showCodeModal = false}
						aria-label="Close this dialog box"
					></button>
				</div>
				<div class="modal-body">
					<p class="mb-3">
						Here's a simplified example showing how to create a live hash display using 
						<code>@wjfe/n-savant</code>'s reactive location object:
					</p>
					<CodeSnippet 
						language={xml} 
						code={liveHashCode} 
						title="Live Hash Display Component"
						copyable={true}
					/>
					<div class="alert alert-info mt-3">
						<strong>💡 Key points:</strong>
						<ul class="mb-0 mt-2">
							<li><code>location.url.hash</code> is reactive and updates automatically</li>
							<li><code>location.hashPaths</code> provides parsed hash routes</li>
							<li><code>$derived()</code> creates reactive computed values</li>
							<li><strong>✨ No manual event listeners needed!</strong></li>
						</ul>
					</div>
				</div>
				<div class="modal-footer">
					<button 
						type="button" 
						class="btn btn-primary" 
						onclick={() => showCodeModal = false}
					>
						Got it! 👍
					</button>
				</div>
			</div>
		</div>
	</div>
	<div class="modal-backdrop fade show"></div>
{/if}
