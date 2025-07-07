<script lang="ts">
	import type { FilterState, GlobalContent } from '$lib/types';
	import { getTranslations, type TranslationKey } from '$lib/utils/translations';
	import Dropdown from './Dropdown.svelte';

	interface Props {
		sortBy: FilterState['sortBy'];
		sortOrder: FilterState['sortOrder'];
		onSortChange: (sortBy: FilterState['sortBy'], sortOrder: FilterState['sortOrder']) => void;
		global?: GlobalContent;
	}

	let { sortBy, sortOrder, onSortChange, global }: Props = $props();

	const translationKeys: TranslationKey[] = [
		'sortNewest',
		'sortOldest',
		'sortTitleAZ',
		'sortTitleZA',
		'sort'
	];
	let t = $derived(getTranslations(global, translationKeys));

	let isOpen = $state(false);
	let triggerElement = $state<HTMLButtonElement>();

	const sortOptions = [
		{ value: 'date-desc', sortBy: 'date' as const, sortOrder: 'desc' as const, icon: '↓' },
		{ value: 'date-asc', sortBy: 'date' as const, sortOrder: 'asc' as const, icon: '↑' },
		{ value: 'title-asc', sortBy: 'title' as const, sortOrder: 'asc' as const, icon: 'A→Z' },
		{ value: 'title-desc', sortBy: 'title' as const, sortOrder: 'desc' as const, icon: 'Z→A' }
	];

	const currentSort = `${sortBy}-${sortOrder}`;
	const currentSortLabel = $derived(() => {
		switch (currentSort) {
			case 'date-desc':
				return t.sortNewest;
			case 'date-asc':
				return t.sortOldest;
			case 'title-asc':
				return t.sortTitleAZ;
			case 'title-desc':
				return t.sortTitleZA;
			default:
				return t.sort;
		}
	});

	const toggleDropdown = () => {
		if (!isOpen) {
			// Calculate position before opening
			if (triggerElement) {
				triggerElement.focus();
			}
		}
		isOpen = !isOpen;
	};

	const handleSortSelect = (value: string) => {
		const [newSortBy, newSortOrder] = value.split('-') as [
			FilterState['sortBy'],
			FilterState['sortOrder']
		];
		onSortChange(newSortBy, newSortOrder);
		isOpen = false;
	};

	const closeDropdown = () => {
		isOpen = false;
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
				d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
			/>
		</svg>
		<span class="truncate">
			{currentSortLabel()}
		</span>
		<svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	<Dropdown {isOpen} {triggerElement} onClose={closeDropdown} width="18rem">
		<div class="py-1">
			{#each sortOptions as option (option.value)}
				{@const label =
					option.value === 'date-desc'
						? t.sortNewest
						: option.value === 'date-asc'
							? t.sortOldest
							: option.value === 'title-asc'
								? t.sortTitleAZ
								: t.sortTitleZA}
				<button
					onclick={() => handleSortSelect(option.value)}
					class="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-white/[.04] {currentSort ===
					option.value
						? 'bg-white/[.06]'
						: ''}"
				>
					<div
						class="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 font-mono text-xs text-white/80"
					>
						{option.icon}
					</div>
					<div class="min-w-0 flex-1">
						<div class="font-medium text-white/90">
							{label}
						</div>
					</div>
					{#if currentSort === option.value}
						<svg
							class="h-4 w-4 text-white/70"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					{/if}
				</button>
			{/each}
		</div>
	</Dropdown>
</div>
