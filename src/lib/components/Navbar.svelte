<script lang="ts">
	import { page } from '$app/stores';
	import { handleAnchorClick } from '$lib/utils';
	import { fade } from 'svelte/transition';
	import MenuClose from './icons/CloseMenu.svelte';
	import MenuOpen from './icons/OpenMenu.svelte';
	import LanguageSelector from './LanguageSelector.svelte';
	import Logo from './Logo.svelte';
	import type { NavbarProps } from '$lib/types/content';

	// Ricevi dati come props
	let { data, menuOpen }: NavbarProps = $props();

	function handleMenuClick() {
		menuOpen = !menuOpen;
	}

	let isLanguageCodeValid = $derived(
		data.languages.some((l) => l.code === $page.url.pathname.split('/')[1])
	);
</script>

<header id="top" class="border-b border-white/5">
	<nav class="flex items-center justify-between px-4 py-8 sm:px-8 lg:px-14">
		<a
			href={$page.url.pathname.split('/')[2]
				? '/' + data.selectedLanguage
				: isLanguageCodeValid
					? '/' + data.selectedLanguage + '#top'
					: '/' + 'en'}
			onclick={handleAnchorClick}
			aria-label="Simone Salerno"
		>
			<Logo />
		</a>

		<div
			class="hidden items-center gap-x-6 text-[1.3rem] md:flex lg:gap-x-7 lg:text-[1.5rem] 2xl:text-[1.7rem]"
		>
			{#each data.global.navigation as route (route.name)}
				<a href={'/' + data.selectedLanguage + route.link} onclick={handleAnchorClick}
					>{route.name}</a
				>
			{/each}

			<div class="2xl:ms-2">
				<LanguageSelector
					languages={data.languages}
					selectedLanguage={data.selectedLanguage}
					navigation={data.navigation}
					projects={data.projects}
					articles={data.articles}
				/>
			</div>
		</div>

		<div class="flex h-[40px] w-[40px] md:hidden">
			{#if menuOpen}
				<div class="fixed top-10 left-7 z-20" transition:fade={{ duration: 300 }}>
					<LanguageSelector
						languages={data.languages}
						selectedLanguage={data.selectedLanguage}
						navigation={data.navigation}
						projects={data.projects}
						articles={data.articles}
					/>
				</div>

				<button class="fixed z-20" transition:fade={{ duration: 100 }} onclick={handleMenuClick}>
					<MenuClose />
				</button>

				<div
					class="fixed top-0 left-0 z-10 flex h-screen w-screen flex-col items-center justify-center bg-black/60 text-2xl backdrop-blur-sm"
					transition:fade={{ duration: 300 }}
				>
					<div class="flex flex-col gap-y-3">
						{#each data.global.navigation as route (route.name)}
							<a
								href={'/' + data.selectedLanguage + route.link}
								onclick={(event) => (handleAnchorClick(event), handleMenuClick())}>{route.name}</a
							>
						{/each}
					</div>
				</div>
			{:else}
				<button class="absolute" transition:fade={{ duration: 100 }} onclick={handleMenuClick}>
					<MenuOpen />
				</button>
			{/if}
		</div>
	</nav>
</header>
