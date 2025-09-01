<script lang="ts">
	import CodeSnippet from '../../../CodeSnippet.svelte';
	import xml from 'svelte-highlight/languages/xml';
	import typescript from 'svelte-highlight/languages/typescript';

	const basicPathRouterCode = `<Router id="app-router" basePath="/app">
  <Route key="home" path="/">
    <HomePage />
  </Route>
  <Route key="about" path="/about">
    <AboutPage />
  </Route>
  <Route key="contact" path="/contact">
    <ContactPage />
  </Route>
</Router>`;

	const linkComponentCode = `<!-- ❌ Don't use regular anchor tags -->
<a href="/profile/123">View Profile</a>

<!-- ✅ Use the Link component instead -->
<Link href="/profile/123">View Profile</Link>

<!-- 🎯 Link with parameters -->
<Link href="/settings/account" class="btn btn-primary">
  Account Settings
</Link>`;

	const nestedRoutingCode = `<Router id="main-router">
  <Route key="app" path="/app/*">
    <AppLayout>
      <!-- Nested router inside AppLayout -->
      <Router id="app-sub-router" basePath="/app">
        <Route key="dashboard" path="/dashboard">
          <Dashboard />
        </Route>
        <Route key="profile" path="/profile/:id">
          <UserProfile />
        </Route>
      </Router>
    </AppLayout>
  </Route>
</Router>`;

	const routeParametersCode = `<!-- Route with single parameter -->
<Route key="user" path="/user/:id">
  {#snippet children(params)}
    <h1>User ID: {params.id}</h1>
  {/snippet}
</Route>

<!-- Route with multiple parameters -->
<Route key="post" path="/blog/:category/:slug">
  {#snippet children(params)}
    <BlogPost 
      category={params.category} 
      slug={params.slug} 
    />
  {/snippet}
</Route>

<!-- Route with rest parameter (catch-all) -->
<Route key="files" path="/files/*">
  {#snippet children(params)}
    <FileExplorer path={params.rest} />
  {/snippet}
</Route>`;

	const urlExamples = `// Basic routes:
// /                    → Home page
// /about               → About page
// /contact             → Contact page

// Parameterized routes:
// /user/123            → User profile for ID 123
// /blog/tech/svelte-5  → Blog post in tech category
// /product/laptop/123  → Product page

// Rest parameters:
// /files/docs/readme.md     → File explorer
// /admin/users/permissions  → Admin section`;

	const routeGuardsCode = `<Route 
  key="admin" 
  path="/admin/*"
  and={(params, location) => user.isAdmin}
>
  <AdminPanel />
</Route>

<Route 
  key="profile" 
  path="/profile/:userId"
  and={(params) => params.userId === currentUser.id || user.canViewProfiles}
>
  <UserProfile />
</Route>`;
</script>

<div class="container">
	<h1>🛣️ Path Routing</h1>
	<p class="lead">
		The classic way to navigate! Path routing uses the URL path to determine which components to render, 
		just like traditional web applications but with SPA speed and smoothness.
	</p>

	<!-- Hero Section -->
	<div class="row mt-4">
		<div class="col-lg-6">
			<div class="card border-primary h-100">
				<div class="card-header bg-primary text-white">
					<h4 class="mb-0">🏗️ Basic Path Routing</h4>
				</div>
				<div class="card-body">
					<p>
						Path routing is the default mode in <code>@wjfe/n-savant</code>. It feels natural 
						because it works just like regular websites - but faster!
					</p>
					<CodeSnippet 
						language={xml} 
						code={basicPathRouterCode} 
						title="Basic Path Router Setup"
					/>
					<div class="alert alert-info mt-3">
						<strong>SEO Friendly:</strong> Search engines love path-based URLs! They're clean, 
						predictable, and easy to understand.
					</div>
				</div>
			</div>
		</div>
		<div class="col-lg-6">
			<div class="card border-success h-100">
				<div class="card-header bg-success text-white">
					<h4 class="mb-0">🔗 Link Components</h4>
				</div>
				<div class="card-body">
					<p>
						Replace <code>&lt;a&gt;</code> tags with <code>&lt;Link&gt;</code> components for 
						smooth navigation without page reloads!
					</p>
					<CodeSnippet 
						language={xml} 
						code={linkComponentCode} 
						title="Using Link Components"
					/>
					<div class="alert alert-warning mt-3">
						<strong>Important:</strong> Regular anchor tags will cause full page reloads. 
						Always use <code>&lt;Link&gt;</code> for internal navigation!
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Advanced Features -->
	<div class="row mt-4">
		<div class="col-lg-6">
			<div class="card border-warning h-100">
				<div class="card-header bg-warning text-dark">
					<h4 class="mb-0">🎯 Route Parameters</h4>
				</div>
				<div class="card-body">
					<p>
						Capture dynamic values from URLs using parameters. Perfect for user IDs, 
						slugs, and dynamic content!
					</p>
					<CodeSnippet 
						language={xml} 
						code={routeParametersCode} 
						title="Route Parameters & Rest Routes"
					/>
					<div class="alert alert-success mt-3">
						<strong>Pro tip:</strong> Use rest parameters (<code>/*</code>) for file paths 
						and hierarchical navigation!
					</div>
				</div>
			</div>
		</div>
		<div class="col-lg-6">
			<div class="card border-info h-100">
				<div class="card-header bg-info text-white">
					<h4 class="mb-0">🏢 Nested Routing</h4>
				</div>
				<div class="card-body">
					<p>
						Build complex layouts with nested routers. Perfect for admin panels, 
						dashboards, and multi-level navigation!
					</p>
					<CodeSnippet 
						language={xml} 
						code={nestedRoutingCode} 
						title="Nested Router Example"
					/>
					<div class="alert alert-info mt-3">
						<strong>Powerful:</strong> Each router can have its own <code>basePath</code> 
						and operates independently within its scope.
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- URL Examples -->
	<div class="row mt-4">
		<div class="col-lg-6">
			<div class="card border-secondary h-100">
				<div class="card-header bg-secondary text-white">
					<h4 class="mb-0">🌐 URL Structure</h4>
				</div>
				<div class="card-body">
					<p>See how different route patterns match real URLs:</p>
					<CodeSnippet 
						language={typescript} 
						code={urlExamples} 
						title="URL Matching Examples"
					/>
					<div class="mt-3">
						<small class="text-muted">
							💡 Notice how parameters and rest routes capture dynamic parts of the URL!
						</small>
					</div>
				</div>
			</div>
		</div>
		<div class="col-lg-6">
			<div class="card border-dark h-100">
				<div class="card-header bg-dark text-white">
					<h4 class="mb-0">🛡️ Route Guards</h4>
				</div>
				<div class="card-body">
					<p>
						Control access to routes with the <code>and</code> property. Perfect for 
						authentication and authorization!
					</p>
					<CodeSnippet 
						language={xml} 
						code={routeGuardsCode} 
						title="Route Guard Examples"
					/>
					<div class="alert alert-danger mt-3">
						<strong>Security:</strong> Route guards help protect sensitive areas but 
						always validate permissions on the server too!
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Key Benefits -->
	<div class="row mt-5">
		<div class="col-lg-8 offset-lg-2">
			<div class="card border-success">
				<div class="card-header bg-success text-white text-center">
					<h3 class="mb-0">🎉 Why Path Routing Rocks</h3>
				</div>
				<div class="card-body">
					<div class="row">
						<div class="col-md-6">
							<h5>🚀 Performance Benefits</h5>
							<ul class="list-unstyled">
								<li>✅ No page reloads</li>
								<li>✅ Instant navigation</li>
								<li>✅ Preserved application state</li>
								<li>✅ Smooth transitions</li>
							</ul>
						</div>
						<div class="col-md-6">
							<h5>🎯 User Experience</h5>
							<ul class="list-unstyled">
								<li>✅ Bookmarkable URLs</li>
								<li>✅ Browser back/forward works</li>
								<li>✅ SEO friendly</li>
								<li>✅ Shareable links</li>
							</ul>
						</div>
					</div>
					<div class="text-center mt-4">
						<p class="lead mb-0">
							<strong>The best of both worlds:</strong> Traditional web navigation with modern SPA performance! 🎯
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Call to Action -->
	<div class="row mt-5">
		<div class="col-lg-10 offset-lg-1">
			<div class="alert alert-primary text-center">
				<h4>🎮 Ready to Try Path Routing?</h4>
				<p class="mb-3">
					Click the "Demo" link in the navigation above to see path routing in action! 
					Watch how the URL changes as you navigate between different sections.
				</p>
				<p class="mb-0">
					<strong>Pro tip:</strong> Open your browser's developer tools and watch the Network tab - 
					notice how no full page requests are made when navigating! 🎉
				</p>
			</div>
		</div>
	</div>
</div>