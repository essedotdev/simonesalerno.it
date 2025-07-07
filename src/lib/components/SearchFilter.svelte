<script lang="ts">
	import { browser } from '$app/environment';
	import type { FilterState } from '$lib/utils/types';

	interface Props {
		filters: FilterState;
		availableTags: string[];
		showDateFilter?: boolean;
		placeholder?: string;
		interface?: { [key: string]: string };
		onUpdateFilters?: (filters: FilterState) => void;
		onClearFilters?: () => void;
	}

	let {
		filters,
		availableTags,
		showDateFilter = false,
		placeholder = 'Search...',
		interface: ui = {},
		onUpdateFilters,
		onClearFilters
	}: Props = $props();

	// Local state for UI
	let showTagDropdown = $state(false);
	let tagSearchQuery = $state('');
	let tagButtonElement = $state<HTMLButtonElement>();
	let dropdownPosition = $state({ top: 0, left: 0 });

	// Filter available tags based on search
	const filteredTags = $derived(
		availableTags.filter((tag) => tag.toLowerCase().includes(tagSearchQuery.toLowerCase()))
	);

	// Calculate dropdown position
	const updateDropdownPosition = () => {
		if (tagButtonElement && browser) {
			const rect = tagButtonElement.getBoundingClientRect();
			dropdownPosition = {
				top: rect.bottom + 8,
				left: rect.left
			};
		}
	};

	// Update position on scroll and resize
	$effect(() => {
		if (showTagDropdown && browser) {
			let rafId: number;

			const handleUpdate = () => {
				cancelAnimationFrame(rafId);
				rafId = requestAnimationFrame(updateDropdownPosition);
			};

			window.addEventListener('scroll', handleUpdate, { passive: true });
			window.addEventListener('resize', handleUpdate, { passive: true });

			return () => {
				window.removeEventListener('scroll', handleUpdate);
				window.removeEventListener('resize', handleUpdate);
				cancelAnimationFrame(rafId);
			};
		}
	});

	// Handle input changes
	const handleQueryChange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		onUpdateFilters?.({ ...filters, query: target.value });
	};

	const handleTagToggle = (tag: string) => {
		const newTags = filters.selectedTags.includes(tag)
			? filters.selectedTags.filter((t) => t !== tag)
			: [...filters.selectedTags, tag];

		onUpdateFilters?.({ ...filters, selectedTags: newTags });
	};

	const handleDateChange = (type: 'from' | 'to', event: Event) => {
		const target = event.target as HTMLInputElement;
		onUpdateFilters?.({
			...filters,
			dateRange: { ...filters.dateRange, [type]: target.value }
		});
	};

	const handleSortChange = (event: Event) => {
		const target = event.target as HTMLSelectElement;
		const [sortBy, sortOrder] = target.value.split('-') as [
			FilterState['sortBy'],
			FilterState['sortOrder']
		];
		onUpdateFilters?.({ ...filters, sortBy, sortOrder });
	};

	const clearAllFilters = () => {
		onClearFilters?.();
	};

	const toggleTagDropdown = () => {
		if (!showTagDropdown) {
			updateDropdownPosition();
		}
		showTagDropdown = !showTagDropdown;
	};

	// Check if any filters are active
	const hasActiveFilters = $derived(
		filters.query.trim() !== '' ||
			filters.selectedTags.length > 0 ||
			filters.dateRange.from ||
			filters.dateRange.to
	);
</script>

<div
	class="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[.01] p-6 backdrop-blur-md"
>
	<!-- Search Input -->
	<div class="relative">
		<input
			type="text"
			value={filters.query}
			oninput={handleQueryChange}
			{placeholder}
			class="w-full rounded-2xl border border-white/10 bg-white/[.02] px-4 py-3 pl-12 text-white placeholder-white/50 focus:border-white/20 focus:bg-white/[.04] focus:outline-none"
		/>
		<svg
			class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-white/50"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
			/>
		</svg>
	</div>

	<!-- Filters Row -->
	<div class="flex flex-wrap gap-3">
		<!-- Tag Filter -->
		{#if availableTags.length > 0}
			<div class="relative">
				<button
					bind:this={tagButtonElement}
					onclick={toggleTagDropdown}
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
					{ui.tags || 'Tags'}
					{#if filters.selectedTags.length > 0}
						<span class="ml-1 rounded-full bg-white/10 px-2 py-1 text-xs">
							{filters.selectedTags.length}
						</span>
					{/if}
					<svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>
			</div>
		{/if}

		<!-- Date Range Filter -->
		{#if showDateFilter}
			<div class="flex items-center gap-2">
				<input
					type="date"
					value={filters.dateRange.from || ''}
					onchange={(e) => handleDateChange('from', e)}
					class="date-input rounded-xl border border-white/10 bg-white/[.02] px-3 py-2 text-white focus:border-white/20 focus:outline-none"
				/>
				<span class="text-white/50">-</span>
				<input
					type="date"
					value={filters.dateRange.to || ''}
					onchange={(e) => handleDateChange('to', e)}
					class="date-input rounded-xl border border-white/10 bg-white/[.02] px-3 py-2 text-white focus:border-white/20 focus:outline-none"
				/>
			</div>
		{/if}

		<!-- Sort Options -->
		<select
			onchange={handleSortChange}
			value={`${filters.sortBy}-${filters.sortOrder}`}
			class="rounded-xl border border-white/10 bg-white/[.02] px-4 py-2 text-white focus:border-white/20 focus:outline-none"
		>
			<option value="date-desc">{ui.sortNewest || 'Newest First'}</option>
			<option value="date-asc">{ui.sortOldest || 'Oldest First'}</option>
			<option value="title-asc">{ui.sortTitleAZ || 'Title A-Z'}</option>
			<option value="title-desc">{ui.sortTitleZA || 'Title Z-A'}</option>
		</select>

		<!-- Clear Filters -->
		{#if hasActiveFilters}
			<button
				onclick={clearAllFilters}
				class="rounded-xl border border-white/10 bg-white/[.02] px-4 py-2 text-white/80 transition-colors hover:bg-white/[.04]"
			>
				{ui.clearFilters || 'Clear All'}
			</button>
		{/if}
	</div>

	<!-- Active Filters -->
	{#if filters.selectedTags.length > 0}
		<div class="flex flex-wrap gap-2">
			{#each filters.selectedTags as tag (tag)}
				<span
					class="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80"
				>
					{tag}
					<button
						onclick={() => handleTagToggle(tag)}
						class="rounded-full p-1 hover:bg-white/10"
						aria-label="Remove {tag} filter"
					>
						<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</span>
			{/each}
		</div>
	{/if}
</div>

<!-- Portal for tag dropdown -->
{#if showTagDropdown && browser}
	<!-- Click outside to close tag dropdown -->
	<div
		class="fixed inset-0 z-[9999]"
		onclick={() => (showTagDropdown = false)}
		onkeydown={(e) => e.key === 'Escape' && (showTagDropdown = false)}
		role="button"
		tabindex="-1"
		aria-label="Close tag dropdown"
	></div>

	<!-- Tag dropdown portal -->
	<div
		class="fixed z-[10000] max-h-60 w-64 overflow-y-auto rounded-xl border border-white/10 bg-white/[.01] shadow-2xl backdrop-blur-md"
		style="top: {dropdownPosition.top}px; left: {dropdownPosition.left}px;"
	>
		<div class="p-3">
			<input
				type="text"
				bind:value={tagSearchQuery}
				placeholder={ui.searchTags || 'Search tags...'}
				class="w-full rounded-lg border border-white/10 bg-white/[.02] px-3 py-2 text-white placeholder-white/50 focus:border-white/20 focus:outline-none"
			/>
		</div>
		<div class="max-h-40 overflow-y-auto">
			{#each filteredTags as tag (tag)}
				<button
					onclick={() => handleTagToggle(tag)}
					class="flex w-full items-center gap-2 px-3 py-2 text-left text-white/80 transition-colors hover:bg-white/[.04]"
				>
					<div
						class="flex h-4 w-4 items-center justify-center rounded border border-white/20 {filters.selectedTags.includes(
							tag
						)
							? 'bg-white/20'
							: ''}"
					>
						{#if filters.selectedTags.includes(tag)}
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
	</div>
{/if}

<style>
	/* Styling for date input icons to make them light */
	.date-input::-webkit-calendar-picker-indicator {
		filter: invert(1) brightness(0.8);
		cursor: pointer;
	}

	.date-input::-webkit-inner-spin-button,
	.date-input::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
