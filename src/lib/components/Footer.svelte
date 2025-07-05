<script lang="ts">
	import { page } from '$app/state';
	import { handleAnchorClick, pages, selectedLanguage, translation } from '$lib/utils';
	import Logo from './Logo.svelte';

	let data = $derived($translation || { global: { navigation: [] } });
	let language = $derived($selectedLanguage || 'en');
	let isLanguageCodeValid = $derived(Object.keys(pages).includes(page.url.pathname.split('/')[1]));
</script>

<footer class="border-t border-white/5 px-4 sm:px-8 lg:px-14">
	<nav
		class="flex items-start justify-between py-8 text-lg sm:pt-10 sm:pb-8 sm:text-xl md:text-2xl"
	>
		<a
			href={page.url.pathname.split('/')[2]
				? '/' + language
				: isLanguageCodeValid
					? '/' + language + '#top'
					: '/' + 'en'}
			onclick={handleAnchorClick}
			aria-label="Logo"
		>
			<Logo />
		</a>

		<div class="flex flex-col gap-x-7 gap-y-2 leading-none opacity-80 md:flex-row">
			{#each data.global.navigation as route (route.name)}
				<a href={'/' + language + route.link} onclick={handleAnchorClick}>{route.name}</a>
			{/each}
		</div>
	</nav>
	<div
		class="text-md flex items-center justify-between pt-2 pb-7 text-neutral-200 opacity-70 sm:text-lg"
	>
		Copyright © 2025 • Simone Salerno
	</div>
</footer>
