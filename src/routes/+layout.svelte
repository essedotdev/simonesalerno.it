<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import FloatingNav from '$lib/components/FloatingNav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import BackToTop from '$lib/components/ui/BackToTop.svelte';
	import '$lib/style/globals.css';
	import { initializeAnalytics, isAnalyticsReady, trackPageView } from '$lib/utils/analytics';
	import { setContext } from 'svelte';

	let { children, data } = $props();

	let scrollY = $state(0);
	let menuOpen = $state(false);

	let isLanguageCodeValid = $derived(
		data.languages.some((l: { code: string }) => l.code === page.url.pathname.split('/')[1])
	);

	// Fornisce i dati come context invece di store
	setContext('layoutData', data);

	// Helper functions for route validation
	function isValidLanguage(lang: string): boolean {
		const validLanguages = data.languages?.map((l) => l.code) || ['it', 'en'];
		return validLanguages.includes(lang);
	}

	function isValidRouteForLang(route: string, lang: string): boolean {
		if (!data.navigation?.[lang]) return false;
		const routeMap = data.navigation[lang];
		return Object.values(routeMap).includes(route);
	}

	function getRouteType(route: string, lang: string): 'projects' | 'blog' | null {
		if (!data.navigation?.[lang]) return null;
		const routeMap = data.navigation[lang];
		if (route === routeMap.projects) return 'projects';
		if (route === routeMap.articles) return 'blog';
		return null;
	}

	$effect(() => {
		if (browser) {
			document.documentElement.classList.toggle('overflow-hidden', menuOpen);
			document.documentElement.classList.toggle('sm:overflow-auto', menuOpen);
		}
	});

	$effect(() => {
		if (browser) {
			const handleScroll = () => {
				scrollY = window.scrollY;
			};
			window.addEventListener('scroll', handleScroll);
			return () => window.removeEventListener('scroll', handleScroll);
		}
	});

	// Initialize analytics on mount
	$effect(() => {
		if (browser) {
			initializeAnalytics();
		}
	});

	// Track page views on navigation
	$effect(() => {
		if (browser && page.url && isAnalyticsReady()) {
			trackPageView(page.url.pathname + page.url.search);
		}
	});

	// Dynamic title based on current route with error handling
	let pageTitle = $derived.by(() => {
		if (!data?.global?.title) return 'Simone Salerno';

		// If page is in error state, return default title
		if (isPageError) {
			return `Simone Salerno • ${data.global.title}`;
		}

		const currentRoute = page.route.id;
		const params = page.params;

		// Home page
		if (currentRoute === '/[page=lang]') {
			return `Simone Salerno • ${data.global.title}`;
		}

		// Projects/Articles listing pages
		if (currentRoute === '/[page=lang]/[route=route]' && params.page && params.route) {
			const routeType = getRouteType(params.route, params.page);
			if (routeType === 'projects') {
				return `Simone Salerno • ${data.projectsPage?.title || 'Projects'}`;
			} else if (routeType === 'blog') {
				return `Simone Salerno • ${data.blogPage?.title || 'Blog'}`;
			}
		}

		// Individual project/article pages
		if (currentRoute === '/[page=lang]/[route=route]/[sub]') {
			const pageData = page.data;
			if (pageData?.content?.translations?.[pageData.currentLang]?.title) {
				return `Simone Salerno • ${pageData.content.translations[pageData.currentLang].title}`;
			}
		}

		// Fallback
		return `Simone Salerno • ${data.global.title}`;
	});

	// Dynamic locale for meta tags
	let currentLocale = $derived(page.params.page || 'it');

	// Detect if current page is in error state or has invalid content
	let isPageError = $derived.by(() => {
		// Check if we're on an error page
		if (page.error) return true;

		const currentRoute = page.route.id;
		const params = page.params;

		// Validate language first
		if (params.page && !isValidLanguage(params.page)) return true;

		// For detail pages, check if content exists
		if (currentRoute === '/[page=lang]/[route=route]/[sub]') {
			const pageData = page.data;
			if (!pageData?.content) return true;
		}

		// For listing pages, validate route against navigation
		if (currentRoute === '/[page=lang]/[route=route]') {
			if (!params.page || !params.route) return true;
			if (!isValidRouteForLang(params.route, params.page)) return true;
		}

		return false;
	});

	// Dynamic OG image URL with error handling
	let ogImageUrl = $derived.by(() => {
		const currentRoute = page.route.id;
		const params = page.params;
		const url = page.url;

		// If page is in error state, always return home OG image
		if (isPageError) {
			const searchParams = new URLSearchParams({
				type: 'home',
				lang: currentLocale
			});
			return `${url.origin}/api/og-image?${searchParams.toString()}`;
		}

		// Determine page type and parameters
		let type = 'home';
		let section: string | undefined;
		let title: string | undefined;
		let imageUrl: string | undefined;
		let imageKey: string | undefined;
		let excerpt: string | undefined;

		// Home page
		if (currentRoute === '/[page=lang]') {
			type = 'home';
		}
		// Projects/Articles listing pages
		else if (currentRoute === '/[page=lang]/[route=route]' && params.page && params.route) {
			const routeType = getRouteType(params.route, params.page);
			if (routeType) {
				type = 'listing';
				section = routeType;
				if (routeType === 'projects') {
					title = data.projectsPage?.title || (currentLocale === 'en' ? 'Projects' : 'Progetti');
				} else {
					title = data.blogPage?.title || (currentLocale === 'en' ? 'Blog' : 'Articoli');
				}
			}
		}
		// Individual project/article pages
		else if (currentRoute === '/[page=lang]/[route=route]/[sub]' && params.page && params.route) {
			const routeType = getRouteType(params.route, params.page);
			const pageData = page.data;

			if (routeType && pageData?.content) {
				type = 'detail';
				section = routeType;

				// Get content data from page
				if (pageData.content.translations?.[pageData.currentLang]) {
					const contentData = pageData.content.translations[pageData.currentLang];
					title = contentData.title;
					excerpt = contentData.description || contentData.excerpt;

					// Try to get OG image key
					if (pageData.content?.meta?.og_image_key) {
						imageKey = pageData.content.meta.og_image_key;
					}
				}
			}
		}

		// Build query parameters
		const searchParams = new URLSearchParams({
			type,
			lang: currentLocale,
			...(section && { section }),
			...(title && { title }),
			...(imageUrl && { image: imageUrl }),
			...(imageKey && { imageKey }),
			...(excerpt && { excerpt })
		});

		return `${url.origin}/api/og-image?${searchParams.toString()}`;
	});
</script>

<svelte:head>
	<meta name="description" content={data.global?.description || ''} />
	<meta name="keywords" content={data.global?.keywords?.join(', ') || ''} />
	<meta name="author" content="Simone Salerno" />
	<title>{pageTitle}</title>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={data.global?.description || ''} />
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Simone Salerno" />
	<meta property="og:logo" content="/logo/logo.png" />
	<meta property="og:url" content={page.url.href} />
	<meta property="og:locale" content={currentLocale === 'en' ? 'en_US' : 'it_IT'} />
	<meta property="og:site_name" content="Simone Salerno" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={data.global?.description || ''} />
	<meta name="twitter:image" content={ogImageUrl} />
	<meta name="twitter:image:alt" content="Simone Salerno" />
	<meta name="twitter:url" content={page.url.href} />
	<meta name="twitter:site" content="@essesdev" />
</svelte:head>

<div
	class="mx-auto flex min-h-screen w-full max-w-[90vw] flex-col overflow-x-hidden scroll-smooth text-white antialiased selection:bg-white/10"
>
	<!-- Passa dati come props ai componenti -->
	<Navbar {data} bind:menuOpen isFloatingNavVisible={scrollY > 350} />

	{#if isLanguageCodeValid}
		<FloatingNav {data} bind:menuOpen {scrollY} />
	{/if}

	<main class="flex-1">
		{@render children()}
	</main>

	<Footer {data} />

	{#if scrollY > 350 && !menuOpen}
		<BackToTop global={data.global} />
	{/if}
</div>
