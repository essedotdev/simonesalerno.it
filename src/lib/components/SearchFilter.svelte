<script lang="ts">
	import type { GlobalContent } from '$lib/types';
	import type { FilterState } from '$lib/types/content';
	import { getTranslations, type TranslationKey } from '$lib/utils/translations';
	import DateRangeDropdown from './ui/DateRangeDropdown.svelte';
	import SortDropdown from './ui/SortDropdown.svelte';
	import TagDropdown from './ui/TagDropdown.svelte';

	interface Props {
		filters: FilterState;
		availableTags: string[];
		showDateFilter?: boolean;
		placeholder: string;
		global?: GlobalContent;
		onUpdateFilters?: (filters: FilterState) => void;
		onClearFilters?: () => void;
	}

	let {
		filters,
		availableTags,
		showDateFilter = false,
		placeholder,
		global,
		onUpdateFilters,
		onClearFilters
	}: Props = $props();

	const translationKeys: TranslationKey[] = ['clearFilters', 'removeFilter'];
	let t = $derived(getTranslations(global, translationKeys));

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

	const handleDateChange = (type: 'from' | 'to', value: string) => {
		onUpdateFilters?.({
			...filters,
			dateRange: { ...filters.dateRange, [type]: value }
		});
	};

	const handleSortChange = (sortBy: FilterState['sortBy'], sortOrder: FilterState['sortOrder']) => {
		onUpdateFilters?.({ ...filters, sortBy, sortOrder });
	};

	const clearAllFilters = () => {
		onClearFilters?.();
	};

	const hasActiveFilters = $derived(
		filters.query.trim() !== '' ||
			filters.selectedTags.length > 0 ||
			filters.dateRange.from ||
			filters.dateRange.to
	);
</script>

<div
	class="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[.01] p-6 backdrop-blur-lg"
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
			<TagDropdown
				{availableTags}
				selectedTags={filters.selectedTags}
				onTagToggle={handleTagToggle}
				{global}
			/>
		{/if}

		<!-- Date Range Filter -->
		{#if showDateFilter}
			<DateRangeDropdown dateRange={filters.dateRange} onDateChange={handleDateChange} {global} />
		{/if}

		<!-- Sort Options -->
		<SortDropdown
			sortBy={filters.sortBy}
			sortOrder={filters.sortOrder}
			onSortChange={handleSortChange}
			{global}
		/>

		<!-- Clear Filters -->
		{#if hasActiveFilters}
			<button
				onclick={clearAllFilters}
				class="rounded-xl border border-white/10 bg-white/[.02] px-4 py-2 text-white/80 transition-colors hover:bg-white/[.04]"
			>
				{t.clearFilters}
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
						aria-label="{t.removeFilter} {tag}"
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
