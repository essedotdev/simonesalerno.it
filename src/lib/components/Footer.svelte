<script lang="ts">
	import { page } from '$app/stores';
	import type { FooterProps } from '$lib/types';
	import { handleAnchorClick } from '$lib/utils';
	import Logo from './Logo.svelte';

	// Receive data as props from parent layout
	let { data }: FooterProps = $props();

	let isLanguageCodeValid = $derived(
		data.languages.some((l) => l.code === $page.url.pathname.split('/')[1])
	);
</script>

<footer class="mx-auto w-full max-w-[90vw] border-t border-white/5">
	<div class="mx-auto w-full max-w-screen-2xl px-4 sm:px-8 lg:px-14">
		<nav
			class="flex items-start justify-between py-8 text-lg sm:pt-10 sm:pb-8 sm:text-xl md:text-2xl"
		>
			<a
				href={$page.url.pathname.split('/')[2]
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
			class="text-md flex items-center justify-between pt-2 pb-7 text-neutral-200 opacity-70 sm:text-lg"
		>
			Copyright © 2025 • Simone Salerno
		</div>
	</div>
</footer>
