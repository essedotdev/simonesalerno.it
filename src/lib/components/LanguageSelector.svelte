<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import type { LanguageSelectorProps } from '$lib/types';

	// Props ricevuti dal layout parent
	let {
		languages = [],
		selectedLanguage = 'en',
		navigation = {},
		projects = [],
		articles = []
	}: LanguageSelectorProps = $props();

	let isOpen = $state(false);

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function closeDropdown(event: Event) {
		const target = event.target as HTMLElement;
		if (target && target.closest('#menu-button') === null) {
			isOpen = false;
		}
	}

	function buildLanguageUrl(targetLang: string): string {
		const currentPath = $page.url.pathname.split('/');
		const currentLang = currentPath[1];
		const route = currentPath[2];
		const slug = currentPath[3];

		if (!route || !slug) {
			// Pagina principale o sezione - mantieni il path
			return `/${targetLang}${currentPath.slice(2).join('/')}`;
		}

		// Trova il tipo di route corrente
		const currentRouteKey = Object.keys(navigation[currentLang] || {}).find(
			(key) => navigation[currentLang][key] === route
		);

		if (!currentRouteKey) {
			// Route non riconosciuta, vai alla homepage
			return `/${targetLang}`;
		}

		const targetRoute = navigation[targetLang]?.[currentRouteKey];
		if (!targetRoute) {
			// Route non disponibile nella lingua target
			return `/${targetLang}`;
		}

		// Trova il contenuto con lo slug corrente
		const collections = currentRouteKey === 'projects' ? projects : articles;
		const content = collections.find((item) => item.translations[currentLang]?.slug === slug);

		if (!content || !content.translations[targetLang]) {
			// Contenuto non disponibile nella lingua target
			// Vai alla sezione principale (es. /en/projects)
			return `/${targetLang}/${targetRoute}`;
		}

		// Contenuto disponibile, vai alla pagina specifica
		const targetSlug = content.translations[targetLang].slug;
		return `/${targetLang}/${targetRoute}/${targetSlug}`;
	}

	onMount(() => {
		document.addEventListener('click', closeDropdown);
		return () => {
			document.removeEventListener('click', closeDropdown);
		};
	});
</script>

<div class="relative inline-block text-left">
	<div>
		<button
			type="button"
			class="flex w-16 cursor-pointer justify-center gap-x-1.5 rounded-md border border-white/5 bg-white/[.02] py-3 text-base backdrop-blur-md"
			id="menu-button"
			aria-expanded={isOpen}
			aria-haspopup="true"
			onclick={toggleDropdown}
		>
			{selectedLanguage.toUpperCase()}
			<svg
				class="mt-[0.15rem] -mr-1 h-5 w-5 text-white/15"
				viewBox="0 0 20 20"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					fill-rule="evenodd"
					d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>
	</div>

	{#if isOpen}
		<div
			in:fly={{ y: -10, duration: 100 }}
			out:fade={{ duration: 100 }}
			class="absolute right-0 z-10 mt-1 w-16 origin-top-right rounded-md border border-white/5 bg-white/[.02] text-base backdrop-blur-md"
			role="menu"
			aria-orientation="vertical"
			aria-labelledby="menu-button"
			tabindex="-1"
		>
			<div class="py-1" role="none">
				{#each languages as language (language.code)}
					{#if selectedLanguage !== language.code}
						<a
							data-sveltekit-reload
							href={buildLanguageUrl(language.code)}
							class="block px-4 py-2 text-sm hover:bg-white/5"
							role="menuitem"
							onclick={() => (isOpen = false)}
						>
							{language.code.toUpperCase()}
						</a>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</div>
