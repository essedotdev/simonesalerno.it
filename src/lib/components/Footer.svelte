<script lang="ts">
	import { page } from '$app/state';
	import type { FooterProps } from '$lib/types';
	import { handleAnchorClick } from '$lib/utils';
	import { getTranslation } from '$lib/utils/translations';
	import Logo from './Logo.svelte';

	// Receive data as props from parent layout
	let { data }: FooterProps = $props();

	let isLanguageCodeValid = $derived(
		data.languages.some((l) => l.code === page.url.pathname.split('/')[1])
	);

	// Get translation with type safety
	let copyrightText = $derived(getTranslation(data.global, 'copyright'));
</script>

<footer class="border-t border-white/5">
	<div class="mx-auto w-full max-w-screen-2xl">
		<nav
			class="flex items-start justify-between px-4 py-8 text-lg sm:px-8 sm:pt-10 sm:pb-8 sm:text-xl md:text-2xl lg:px-14"
		>
			<a
				href={page.url.pathname.split('/')[2]
					? '/' + data.selectedLanguage
					: isLanguageCodeValid
						? '/' + data.selectedLanguage + '#top'
						: '/' + 'en'}
				onclick={handleAnchorClick}
				aria-label="Logo"
			>
				<Logo />
			</a>

			<div class="flex flex-col gap-x-7 gap-y-2 leading-none opacity-80 md:flex-row">
				{#each data.global.navigation as route (route.name)}
					<a href={'/' + data.selectedLanguage + route.link} onclick={handleAnchorClick}
						>{route.name}</a
					>
				{/each}
			</div>
		</nav>
		<div
			class="text-md flex items-center justify-between px-4 pt-2 pb-7 text-neutral-200 opacity-70 sm:px-8 sm:text-lg lg:px-14"
		>
			{copyrightText}
		</div>
	</div>
</footer>
