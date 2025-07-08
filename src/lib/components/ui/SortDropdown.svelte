<script lang="ts">
	import type { FilterState, GlobalContent } from '$lib/types';
	import { getTranslations, type TranslationKey } from '$lib/utils/translations';
	import {
		ArrowDownAZ,
		ArrowDownZA,
		ArrowUpDown,
		CalendarArrowDown,
		CalendarArrowUp,
		Check,
		ChevronDown
	} from '@lucide/svelte';
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

	// Generate unique IDs for ARIA
	const dropdownId = `sort-dropdown-${Math.random().toString(36).substring(7)}`;
	const triggerId = `sort-trigger-${Math.random().toString(36).substring(7)}`;

	const sortOptions = [
		{
			value: 'date-desc',
			sortBy: 'date' as const,
			sortOrder: 'desc' as const,
			IconComponent: CalendarArrowDown
		},
		{
			value: 'date-asc',
			sortBy: 'date' as const,
			sortOrder: 'asc' as const,
			IconComponent: CalendarArrowUp
		},
		{
			value: 'title-asc',
			sortBy: 'title' as const,
			sortOrder: 'asc' as const,
			IconComponent: ArrowDownAZ
		},
		{
			value: 'title-desc',
			sortBy: 'title' as const,
			sortOrder: 'desc' as const,
			IconComponent: ArrowDownZA
		}
	];

	const currentSort = $derived(`${sortBy}-${sortOrder}`);
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
		id={triggerId}
		aria-expanded={isOpen}
		aria-haspopup="menu"
		aria-controls={dropdownId}
		onclick={toggleDropdown}
		class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.02] px-4 py-2 text-white/80 transition-colors hover:bg-white/[.04] cursor-pointer"
	>
		<ArrowUpDown class="h-4 w-4" />
		<span class="truncate">
			{currentSortLabel()}
		</span>
		<ChevronDown class="ml-1 h-4 w-4" />
	</button>

	<Dropdown
		{isOpen}
		{triggerElement}
		{dropdownId}
		{triggerId}
		onClose={closeDropdown}
		width="18rem"
		role="menu"
		enableFocusTrap={true}
	>
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
						class="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-white/80"
					>
						<option.IconComponent class="h-4 w-4" />
					</div>
					<div class="min-w-0 flex-1">
						<div class="font-medium text-white/90">
							{label}
						</div>
					</div>
					{#if currentSort === option.value}
						<Check class="h-4 w-4 text-white/70" />
					{/if}
				</button>
			{/each}
		</div>
	</Dropdown>
</div>
