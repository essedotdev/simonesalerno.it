<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import BackToTop from '$lib/components/BackToTop.svelte';
	import FloatingNav from '$lib/components/FloatingNav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import '$lib/style/globals.css';
	import { menuStatus } from '$lib/utils';
	import { initializeAnalytics, isAnalyticsReady, trackPageView } from '$lib/utils/analytics';
	import { setContext } from 'svelte';

	let { children, data } = $props();

	let scrollY = $state(0);

	// Fornisce i dati come context invece di store
	setContext('layoutData', data);

	$effect(() => {
		if (browser) {
			document.documentElement.classList.toggle('overflow-hidden', $menuStatus);
			document.documentElement.classList.toggle('sm:overflow-auto', $menuStatus);
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
		if (browser && $page.url && isAnalyticsReady()) {
			trackPageView($page.url.pathname + $page.url.search);
		}
	});
</script>

<svelte:head>
	<meta name="description" content={data.global.description} />
	<meta name="keywords" content={data.global.keywords.join(', ')} />
	<meta name="author" content="Simone Salerno" />
	<title>Simone Salerno • {data.global.title}</title>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Simone Salerno" />
	<meta property="og:description" content={data.global.description} />
	<meta property="og:image" content="/logo/logo.png" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Simone Salerno" />
	<meta name="twitter:description" content={data.global.description} />
	<meta name="twitter:image" content="/logo/logo.png" />
</svelte:head>

<div class="flex min-h-screen flex-col overflow-x-hidden scroll-smooth text-white antialiased selection:bg-white/10">
	<!-- Passa dati come props ai componenti -->
	<Navbar {data} />
	<FloatingNav {data} />

	<main class="flex-1">
		{@render children()}
	</main>

	<Footer {data} />

	{#if scrollY > 200}
		<BackToTop />
	{/if}
</div>
