<script lang="ts">
	import { page } from '$app/stores';
	import type { FloatingNavProps } from '$lib/types/content';
	import { handleAnchorClick } from '$lib/utils';
	import { fade } from 'svelte/transition';
	import { Menu } from '@lucide/svelte';

	// Receive data as props from parent layout
	let { data, menuOpen }: FloatingNavProps = $props();

	function handleMenuClick() {
		menuOpen = !menuOpen;
	}

	let isLanguageCodeValid = $derived(
		data.languages.some((l) => l.code === $page.url.pathname.split('/')[1])
	);

	let scroll = $state(0);
	let show = $derived(() => scroll > 350 && !menuOpen);
</script>

<svelte:window bind:scrollY={scroll} />

{#if show()}
	<header
		class="fixed top-[1.7rem] z-50 flex justify-end sm:top-4 sm:left-1/2 -translate-x-1/2 sm:justify-center"
		transition:fade={{ duration: 150 }}
	>
		<nav class="rounded-s-full rounded-e-none bg-neutral-900/20 sm:rounded-full">
			<div
				class="flex items-center justify-between rounded-s-full rounded-e-none border border-white/5 bg-white/[.01] ps-8 pe-[calc(0.95rem+5vw)] text-lg backdrop-blur-md sm:rounded-full sm:bg-white/[.02] sm:px-4"
			>
				<a
					href={$page.url.pathname.split('/')[2]
						? '/' + data.selectedLanguage
						: isLanguageCodeValid
							? '/' + data.selectedLanguage + '#top'
							: '/' + 'en'}
					class="me-4 pt-[0.95rem] pb-4 sm:px-3"
					onclick={handleAnchorClick}
					aria-label="Logo"
				>
					<enhanced:img class="h-10 w-min" src="/static/logo/logo.png" alt="Logo" />
				</a>

				{#each data.global.navigation as route (route.name)}
					<a
						href={'/' + data.selectedLanguage + route.link}
						class="hidden px-3 sm:flex"
						onclick={handleAnchorClick}>{route.name}</a
					>
				{/each}

				<div class="flex h-[40px] w-[40px] sm:hidden">
					{#if !menuOpen}
						<button class="absolute" transition:fade={{ duration: 100 }} onclick={handleMenuClick}>
							<Menu class="h-6 w-6" />
						</button>
					{/if}
				</div>
			</div>
		</nav>
	</header>
{/if}
