<script lang="ts">
	import { page } from '$app/state';
	import { languages, pages, selectedLanguage } from '$lib/utils';
	import type { PageMap } from '$lib/utils/types';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { fade, fly } from 'svelte/transition';
	let isOpen = false;

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function closeDropdown(event: any) {
		if (event.target.closest('#menu-button') === null) {
			isOpen = false;
		}
	}

	function buildLanguageUrl(languageCode: string): string {
		const currentPath = page.url.pathname.split('/');
		const currentLanguage = currentPath[1];
		const subpage = currentPath[2];

		const currentSubpageKey = Object.keys(pages[currentLanguage] as PageMap[string]).find(
			(key) => pages[currentLanguage][key] === subpage
		);
		const targetSubpage = pages[languageCode][currentSubpageKey as string] || '';

		return (
			'/' +
			languageCode +
			'/' +
			targetSubpage +
			(currentPath.slice(3).length ? '/' + currentPath.slice(3).join('/') : '')
		);
	}

	onMount(() => {
		document.addEventListener('click', closeDropdown);
		return () => {
			document.removeEventListener('click', closeDropdown);
		};
	});

	const data = get(languages);
	const selected = get(selectedLanguage);
</script>

<div class="relative inline-block text-left">
	<div>
		<button
			type="button"
			class="flex w-16 justify-center gap-x-1.5 rounded-md border border-white/5 bg-white/[.02] py-3 text-base backdrop-blur-md"
			id="menu-button"
			aria-expanded={isOpen}
			aria-haspopup="true"
			onclick={toggleDropdown}
		>
			{#each data as language}
				{#if selected === language.code}
					{language.code.toUpperCase()}
				{/if}
			{/each}
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
				{#each data as language}
					{#if selected !== language.code}
						<a
							data-sveltekit-reload
							href={buildLanguageUrl(language.code)}
							class="block px-4 py-2 text-sm"
							role="menuitem"
						>
							{language.code.toUpperCase()}
						</a>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</div>
