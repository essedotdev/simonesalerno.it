<script lang="ts">
	import { page } from '$app/stores';
	import { handleAnchorClick, menuStatus } from '$lib/utils';
	import { fade } from 'svelte/transition';
	import MenuOpen from './icons/OpenMenu.svelte';
	import type { FloatingNavProps } from '$lib/types';

	// Receive data as props from parent layout
	let { data }: FloatingNavProps = $props();

	function handleMenuClick() {
		menuStatus.update((value) => !value);
	}

	let isLanguageCodeValid = $derived(
		data.languages.some((l) => l.code === $page.url.pathname.split('/')[1])
	);

	let scroll = $state(0);
	let show = $derived(() => scroll > 350 && !$menuStatus);
</script>

<svelte:window bind:scrollY={scroll} />

{#if show()}
	<header
		class="fixed top-[1.7rem] z-10 flex w-full justify-end sm:top-4 sm:left-0 sm:justify-center"
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
					{#if !$menuStatus}
						<button class="absolute" transition:fade={{ duration: 100 }} onclick={handleMenuClick}>
							<MenuOpen />
						</button>
					{/if}
				</div>
			</div>
		</nav>
	</header>
{/if}
