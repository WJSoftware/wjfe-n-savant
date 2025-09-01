<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import Hero from './Hero.svelte';
	import Quickstart from './Quickstart.svelte';
	import FeaturesTable from './FeaturesTable.svelte';
	import CodeSnippet from '../../CodeSnippet.svelte';
	import { RouterTrace, Link } from '@wjfe/n-savant';
	import xml from 'svelte-highlight/languages/xml';
	import typescript from 'svelte-highlight/languages/typescript';

	const pathRoutingExample = `<Router id="app">
  <Route key="home" path="/">
    <HomePage />
  </Route>
  <Route key="profile" path="/user/:id">
    {#snippet children(params)}
      <UserProfile userId={params.id} />
    {/snippet}
  </Route>
</Router>`;

	const hashRoutingExample = `// Initialize with hash as default mode
init({ implicitMode: 'hash' });

// Now you can omit the hash property!
<Router id="modals">
  <Route key="login" path="/login">
    <LoginModal />
  </Route>
  <Route key="settings" path="/settings">
    <SettingsModal />
  </Route>
</Router>`;

	const multiHashExample = `<!-- Two independent hash routers! -->
<Router hash="nav" id="sidebar">
  <Route hash="nav" key="menu" path="/menu">
    <SidebarMenu />
  </Route>
</Router>

<Router hash="content" id="main">
  <Route hash="content" key="dashboard" path="/dashboard">
    <Dashboard />
  </Route>
</Router>`;
</script>

<div class="root" transition:fade={{ duration: 500 }}>
	<Hero />
	
	<!-- Key Features Showcase -->
	<div class="row mt-5 g-4">
		<div class="col-lg-4">
			<div class="card border-primary h-100" transition:fly={{ delay: 100, y: 50, duration: 600 }}>
				<div class="card-header bg-primary text-white text-center">
					<h4 class="mb-0">🛣️ Path Routing</h4>
				</div>
				<div class="card-body">
					<p class="card-text">
						Classic URL path-based routing with modern SPA performance. SEO-friendly, 
						bookmarkable, and lightning fast!
					</p>
					<CodeSnippet 
						language={xml} 
						code={pathRoutingExample} 
						title="Path Routing Example"
					/>
					<div class="text-center mt-3">
						<Link href="/path-routing" class="btn btn-primary">
							Try Path Routing →
						</Link>
					</div>
				</div>
			</div>
		</div>
		
		<div class="col-lg-4">
			<div class="card border-success h-100" transition:fly={{ delay: 200, y: 50, duration: 600 }}>
				<div class="card-header bg-success text-white text-center">
					<h4 class="mb-0">🚀 Hash Routing</h4>
				</div>
				<div class="card-body">
					<p class="card-text">
						Fragment-based routing that works everywhere! Perfect for modals, 
						overlays, and client-side navigation. Also works great in Electron apps!
					</p>
					<p class="small text-muted mb-3">
						💡 <strong>Pro tip:</strong> Set <code>implicitMode: 'hash'</code> during initialization 
						to avoid repeating <code>hash</code> on every component!
					</p>
					<CodeSnippet 
						language={xml} 
						code={hashRoutingExample} 
						title="Hash Routing Example"
					/>
					<div class="text-center mt-3">
						<Link href="/hash-routing" class="btn btn-success">
							Try Hash Routing →
						</Link>
					</div>
				</div>
			</div>
		</div>
		
		<div class="col-lg-4">
			<div class="card border-warning h-100" transition:fly={{ delay: 300, y: 50, duration: 600 }}>
				<div class="card-header bg-warning text-dark text-center">
					<h4 class="mb-0">🌟 Multi-Hash Magic</h4>
				</div>
				<div class="card-body">
					<p class="card-text">
						<strong>World's first!</strong> Multiple independent hash routers 
						running simultaneously. Perfect for micro-frontends!
					</p>
					<CodeSnippet 
						language={xml} 
						code={multiHashExample} 
						title="Multi-Hash Example"
					/>
					<div class="text-center mt-3">
						<Link href="/hash-routing" class="btn btn-warning text-dark">
							See Multi-Hash →
						</Link>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Why Choose N-Savant -->
	<div class="row mt-5">
		<div class="col-lg-8 offset-lg-2">
			<div class="card border-info" transition:fly={{ delay: 400, y: 50, duration: 600 }}>
				<div class="card-header bg-info text-white text-center">
					<h3 class="mb-0">🎯 Why Choose @wjfe/n-savant?</h3>
				</div>
				<div class="card-body">
					<div class="row">
						<div class="col-md-6">
							<h5 class="text-info">🚀 Performance</h5>
							<ul class="list-unstyled">
								<li>✅ Less than 1,200 lines of code</li>
								<li>✅ Zero-config router setup</li>
								<li>✅ Instant navigation</li>
								<li>✅ No page reloads</li>
							</ul>

							<h5 class="text-info mt-4">🎪 Unique Features</h5>
							<ul class="list-unstyled">
								<li class="world-first">🥇 <strong>World's first</strong> multi-hash routing</li>
								<li class="world-first">🥇 <strong>World's first</strong> simultaneous path + hash routing</li>
								<li>✅ Multi-route matching</li>
								<li>✅ Micro-frontend ready</li>
							</ul>
						</div>
						<div class="col-md-6">
							<h5 class="text-info">🛠️ Developer Experience</h5>
							<ul class="list-unstyled">
								<li>✅ Full TypeScript support</li>
								<li>✅ Superb IntelliSense</li>
								<li>✅ Reactive by design</li>
								<li>✅ Easy learning curve - piggybacks on Svelte v5 reactivity</li>
							</ul>

							<h5 class="text-info mt-4">🌐 Production Ready</h5>
							<ul class="list-unstyled">
								<li>✅ SEO friendly</li>
								<li>✅ Works with any hosting</li>
								<li>✅ Browser back/forward support</li>
								<li>✅ Deep linking support</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Quick Start and Features -->
	<div class="row mt-5">
        <div class="col-12 col-lg-6 col-xxl-4">
            <div transition:fly={{ delay: 500, y: 50, duration: 600 }}>
                <Quickstart />
            </div>
        </div>
        <div class="col-12 col-lg-6 col-xxl-8">
            <div transition:fly={{ delay: 600, y: 50, duration: 600 }}>
                <FeaturesTable />
            </div>
        </div>
    </div>

	<!-- Call to Action -->
	<div class="row mt-5">
		<div class="col-lg-10 offset-lg-1">
			<div class="alert alert-primary text-center" transition:fly={{ delay: 700, y: 50, duration: 600 }}>
				<h4 class="alert-heading">🎮 Ready to Get Started?</h4>
				<p class="mb-3">
					Explore the different routing modes and see the power of @wjfe/n-savant in action!
				</p>
				<div class="d-flex flex-wrap justify-content-center gap-3">
					<Link href="/path-routing" class="btn btn-primary btn-lg">
						🛣️ Path Routing Demo
					</Link>
					<Link href="/hash-routing" class="btn btn-success btn-lg">
						🚀 Hash Routing Demo
					</Link>
				</div>
			</div>
		</div>
	</div>

	<!-- Router Trace Section -->
    <div class="row mt-5">
        <div class="col">
            <div class="card" transition:fly={{ delay: 800, y: 50, duration: 600 }}>
                <h3 class="card-header">🔍 About the Route Tracer</h3>
                <div class="card-body">
                    <p>
                        The following trace shows the current router's state and will appear throughout 
                        the demo pages. It's a powerful debugging tool that shows exactly how routes 
                        are being matched and processed.
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

    .card {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .btn {
        transition: all 0.2s ease;
    }

    .btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .world-first {
        font-size: 1.1em;
        font-weight: 500;
    }
</style>
