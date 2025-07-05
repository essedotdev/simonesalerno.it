<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import FloatingNav from '$lib/components/FloatingNav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import '$lib/style/globals.css';
	import { languages, menuStatus, selectedLanguage, translation } from '$lib/utils';
	import { initializeAnalytics, isAnalyticsReady, trackPageView } from '$lib/utils/analytics';
	import { setContext } from 'svelte';

	let { children, data } = $props();

	// Aggiorna gli store quando cambiano i dati (mantengo per compatibilità)
	$effect(() => {
		selectedLanguage.set(data.selectedLanguage);
		languages.set(data.languages);
		translation.set({
			global: data.global,
			welcome: data.welcome,
			projects: data.projects,
			about: data.about,
			contact: data.contact
		});
	});

	$effect(() => {
		if (browser) {
			document.documentElement.classList.toggle('overflow-hidden', $menuStatus);
			document.documentElement.classList.toggle('sm:overflow-auto', $menuStatus);
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

	// Fornisce i dati globali come context per i componenti figli
	setContext('layoutData', {
		global: data.global,
		selectedLanguage: data.selectedLanguage
	});
</script>

<svelte:head>
	<meta name="description" content={data.global.description} />
	<meta name="keywords" content={data.global.keywords.join(', ')} />
	<meta name="author" content="Simone Salerno" />

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

<div class="relative mx-auto flex min-h-screen w-[95%] flex-col lg:w-[90%] xl:w-[85%] 2xl:w-[75%]">
	<Navbar />
	<FloatingNav />

	<main class="flex-grow">
		{@render children()}
	</main>

	<Footer />
</div>
