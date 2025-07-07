<script lang="ts">
	import type { GlobalContent } from '$lib/types';
	import { getTranslations, type TranslationKey } from '$lib/utils/translations';
	import Dropdown from './Dropdown.svelte';

	interface Props {
		availableTags: string[];
		selectedTags: string[];
		onTagToggle: (tag: string) => void;
		global?: GlobalContent;
	}

	let { availableTags, selectedTags, onTagToggle, global }: Props = $props();

	const translationKeys: TranslationKey[] = ['tags', 'searchTags', 'closeTagDropdown'];
	let t = $derived(getTranslations(global, translationKeys));

	let isOpen = $state(false);
	let tagSearchQuery = $state('');
	let triggerElement = $state<HTMLButtonElement>();

	const filteredTags = $derived(
		availableTags.filter((tag) => tag.toLowerCase().includes(tagSearchQuery.toLowerCase()))
	);

	const toggleDropdown = () => {
		if (!isOpen) {
			// Calculate position before opening
			if (triggerElement) {
				triggerElement.focus();
			}
		}
		isOpen = !isOpen;
		if (!isOpen) {
			tagSearchQuery = '';
		}
	};

	const handleTagSelect = (tag: string) => {
		onTagToggle(tag);
	};

	const closeDropdown = () => {
		isOpen = false;
		tagSearchQuery = '';
	};
</script>

<div class="relative">
	<button
		bind:this={triggerElement}
		onclick={toggleDropdown}
		class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.02] px-4 py-2 text-white/80 transition-colors hover:bg-white/[.04]"
	>
		<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"
			/>
		</svg>
		{t.tags}
		{#if selectedTags.length > 0}
			<span class="ml-1 rounded-full bg-white/10 px-2 py-1 text-xs">
				{selectedTags.length}
			</span>
		{/if}
		<svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	<Dropdown {isOpen} {triggerElement} onClose={closeDropdown} width="22rem" maxHeight="20rem">
		<div class="p-3">
			<input
				type="text"
				bind:value={tagSearchQuery}
				placeholder={t.searchTags}
				class="w-full rounded-lg border border-white/10 bg-white/[.02] px-3 py-2 text-white placeholder-white/50 focus:border-white/20 focus:outline-none"
			/>
		</div>
		<div class="max-h-40 overflow-y-auto">
			{#each filteredTags as tag (tag)}
				<button
					onclick={() => handleTagSelect(tag)}
					class="flex w-full items-center gap-2 px-3 py-2 text-left text-white/80 transition-colors hover:bg-white/[.04]"
				>
					<div
						class="flex h-4 w-4 items-center justify-center rounded border border-white/20 {selectedTags.includes(
							tag
						)
							? 'bg-white/20'
							: ''}"
					>
						{#if selectedTags.includes(tag)}
							<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						{/if}
					</div>
					{tag}
				</button>
			{/each}
		</div>
	</Dropdown>
</div>
