<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	// Import goto
	import type { LanguageSelectorProps } from '$lib/types';
	import { ChevronDown } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	// Props ricevuti dal layout parent
	let {
		languages = [],
		selectedLanguage = 'en',
		navigation = {},
		projects = [],
		articles = [],
		isFloatingNav = false
	}: LanguageSelectorProps & { isFloatingNav?: boolean } = $props();

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
		const currentPath = page.url.pathname.split('/');
		const currentLang = currentPath[1];
		const route = currentPath[2];
		const slug = currentPath[3];
		const searchParams = page.url.search;

		// Se non c'è una route (homepage)
		if (!route) {
			return `/${targetLang}${searchParams}`;
		}

		// Trova il tipo di route corrente
		const currentRouteKey = Object.keys(navigation[currentLang] || {}).find(
			(key) => navigation[currentLang][key] === route
		);

		if (!currentRouteKey) {
			// Route non riconosciuta, vai alla homepage
			return `/${targetLang}${searchParams}`;
		}

		const targetRoute = navigation[targetLang]?.[currentRouteKey];
		if (!targetRoute) {
			// Route non disponibile nella lingua target
			return `/${targetLang}${searchParams}`;
		}

		// Se non c'è slug (pagina di sezione come /en/blog)
		if (!slug) {
			return `/${targetLang}/${targetRoute}${searchParams}`;
		}

		// Trova il contenuto con lo slug corrente
		const collections = currentRouteKey === 'projects' ? projects : articles;
		const content = collections.find((item) => item.translations[currentLang]?.slug === slug);

		if (!content || !content.translations[targetLang]) {
			// Contenuto non disponibile nella lingua target
			// Vai alla sezione principale (es. /en/projects)
			return `/${targetLang}/${targetRoute}${searchParams}`;
		}

		// Contenuto disponibile, vai alla pagina specifica
		const targetSlug = content.translations[targetLang].slug;
		return `/${targetLang}/${targetRoute}/${targetSlug}${searchParams}`;
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
			class="flex w-16 cursor-pointer justify-center gap-x-1.5 border border-white/5 bg-white/[.02] backdrop-blur-md {isFloatingNav
				? 'rounded-s-lg rounded-e-2xl pt-[0.5rem] pb-2 text-sm'
				: 'rounded-lg py-3 text-base'}"
			id="menu-button"
			aria-expanded={isOpen}
			aria-haspopup="true"
			onclick={toggleDropdown}
		>
			{selectedLanguage.toUpperCase()}
			<ChevronDown class="{isFloatingNav ? '' : 'mt-[0.15rem]'} -mr-1 h-5 w-5 text-white/15" />
		</button>
	</div>

	{#if isOpen}
		<div
			in:fade={{ duration: 100 }}
			out:fade={{ duration: 100 }}
			class="absolute right-0 z-10 mt-1 w-16 origin-top-right rounded-lg border border-white/5 bg-white/[.02] text-base backdrop-blur-md"
			role="menu"
			aria-orientation="vertical"
			aria-labelledby="menu-button"
			tabindex="-1"
		>
			<div role="none">
				{#each languages as language (language.code)}
					{#if selectedLanguage !== language.code}
						<!-- svelte-ignore a11y_invalid_attribute -->
						<a
							href="javascript:void(0);"
							class="block px-4 {isFloatingNav
								? 'py-2 text-xs'
								: 'py-3 text-sm'} hover:bg-white/[0.04]"
							role="menuitem"
							onclick={() => {
								isOpen = false;
								goto(buildLanguageUrl(language.code), { noScroll: true });
							}}
						>
							{language.code.toUpperCase()}
						</a>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</div>
