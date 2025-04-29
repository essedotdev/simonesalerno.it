<script lang="ts">
	import { browser } from '$app/environment';
	import FloatingNav from '$lib/components/FloatingNav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import '$lib/style/globals.css';
	import { languages, menuStatus, selectedLanguage, translation } from '$lib/utils';

	let { children, data } = $props();

	selectedLanguage.set(data.selectedLanguage);
	languages.set(data.languages);
	translation.set({
		global: data.global,
		welcome: data.welcome,
		projects: data.projects,
		about: data.about,
		contact: data.contact
	});

	$effect(() => {
		if (browser) {
			document.documentElement.classList.toggle('overflow-hidden', $menuStatus);
			document.documentElement.classList.toggle('sm:overflow-auto', $menuStatus);
		}
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
