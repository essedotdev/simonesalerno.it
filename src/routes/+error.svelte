<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { ContentLoader } from '$lib/utils/content';
	import { onMount } from 'svelte';

	// State for translations
	let global: any = $state(null);
	let currentLang = $state('en');

	// Load translations on mount
	onMount(async () => {
		if (browser) {
			try {
				// Determine language from URL
				const pathSegments = page.url.pathname.split('/').filter(Boolean);
				const possibleLang = pathSegments[0];
				currentLang = ['en', 'it'].includes(possibleLang) ? possibleLang : 'en';

				// Load global translations
				const loader = new ContentLoader();
				global = await loader.loadGlobal(currentLang);
			} catch (error) {
				console.error('Error loading translations for error page:', error);
				// Keep global as null, will show missing translation placeholders
			}
		}
	});

	// Derive translations from global interface
	let notFoundText = $derived(
		global?.interface?.find((item: any) => item.name === 'pageNotFound')?.value
	);
	let backHomeText = $derived(
		global?.interface?.find((item: any) => item.name === 'backHome')?.value
	);

	// Generate home URL based on current language
	let homeUrl = $derived(currentLang === 'en' ? '/' : `/${currentLang}`);
</script>

<div class="flex min-h-[80vh] flex-col items-center justify-center">
	<h1 class="text-9xl font-bold">{page.status}</h1>
	<p class="mt-2 text-4xl">{notFoundText}</p>
	<a
		data-sveltekit-reload
		href={homeUrl}
		class="mt-8 flex items-center gap-x-1 text-2xl hover:underline"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			style="fill: #f3f4f6;transform: ;msFilter:;margin-bottom: -0.2rem;"
			><path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z"></path></svg
		>
		{backHomeText}
	</a>
</div>
