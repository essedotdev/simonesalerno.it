<script lang="ts">
	import { browser } from '$app/environment';
	import { languages, menuStatus, selectedLanguage, translation } from '$lib/utils';
	import Navbar from '$lib/components/Navbar.svelte';
	import FloatingNav from '$lib/components/FloatingNav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import '$lib/style/globals.css';

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
</svelte:head>

<div class="relative mx-auto w-[95%] lg:w-[90%] xl:w-[85%] 2xl:w-[75%]">
	<Navbar />
	<FloatingNav />

	{@render children()}

	<Footer />
</div>
