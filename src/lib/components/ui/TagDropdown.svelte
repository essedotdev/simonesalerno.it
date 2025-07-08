<script lang="ts">
	import type { GlobalContent } from '$lib/types';
	import { getTranslations, type TranslationKey } from '$lib/utils/translations';
	import { Check, ChevronDown, Tag } from '@lucide/svelte';
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
	let dropdownContentElement = $state<HTMLElement>();

	// Generate unique IDs for ARIA
	const dropdownId = `tag-dropdown-${Math.random().toString(36).substring(7)}`;
	const triggerId = `tag-trigger-${Math.random().toString(36).substring(7)}`;

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
		id={triggerId}
		aria-expanded={isOpen}
		aria-haspopup="listbox"
		aria-controls={dropdownId}
		onclick={toggleDropdown}
		class="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[.02] px-4 py-2 text-white/80 transition-colors hover:bg-white/[.04]"
	>
		<Tag class="h-4 w-4" />
		{t.tags}
		{#if selectedTags.length > 0}
			<span class="ml-1 rounded-full bg-white/10 px-2 py-1 text-xs">
				{selectedTags.length}
			</span>
		{/if}
		<ChevronDown class="ml-auto h-4 w-4" />
	</button>

	<Dropdown
		{isOpen}
		{triggerElement}
		{dropdownId}
		{triggerId}
		onClose={closeDropdown}
		width="22rem"
		maxHeight="20rem"
		role="listbox"
		enableFocusTrap={true}
		autoFocus={false}
	>
		<div class="p-3" bind:this={dropdownContentElement} tabindex="-1">
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
							<Check class="h-3 w-3" />
						{/if}
					</div>
					{tag}
				</button>
			{/each}
		</div>
	</Dropdown>
</div>
