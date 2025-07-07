<script lang="ts">
	import { browser } from '$app/environment';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import SearchFilter from '$lib/components/SearchFilter.svelte';
	import { projectsFilterStore } from '$lib/stores/filterStore';
	import type { ProjectsSectionProps } from '$lib/types/content';
	import { applyFilters, extractTags } from '$lib/utils/searchUtils';
	import type { FilterState } from '$lib/types/content';
	import { onMount } from 'svelte';
	import { inview, type Options } from 'svelte-inview';
	import { getTranslations, type TranslationKey } from '$lib/utils/translations';

	// Receive data as props
	let {
		projects,
		selectedLanguage,
		navigation,
		projectsPage,
		showFilters = false,
		showViewAllButton = false,
		global
	}: ProjectsSectionProps = $props();

	let isInView = $state(false);
	let screenSize = $state('desktop'); // 'mobile' | 'tablet' | 'desktop'

	const options: Options = {
		rootMargin: '-100px',
		unobserveOnEnter: true
	};

	// Check screen size for responsive project limits
	onMount(() => {
		if (browser) {
			const updateScreenSize = () => {
				if (window.matchMedia('(min-width: 1280px)').matches) {
					screenSize = 'desktop';
				} else if (window.matchMedia('(min-width: 768px)').matches) {
					screenSize = 'tablet';
				} else {
					screenSize = 'mobile';
				}
			};

			updateScreenSize();
			window.addEventListener('resize', updateScreenSize);
			return () => window.removeEventListener('resize', updateScreenSize);
		}
	});

	// Filter projects that have translation for current language
	let languageFilteredProjects = $derived(
		projects.filter((project) => project.translations[selectedLanguage])
	);

	// Extract available tags for the current language
	let availableTags = $derived(extractTags(languageFilteredProjects, selectedLanguage));

	// Apply search filters only if showFilters is enabled
	let filteredProjects = $derived(
		showFilters
			? applyFilters(languageFilteredProjects, $projectsFilterStore, selectedLanguage, 'projects')
			: languageFilteredProjects
	);

	// Limit projects based on screen size if showViewAllButton is enabled (home page)
	let currentProjects = $derived.by(() => {
		if (!showViewAllButton) return filteredProjects;

		const limit = screenSize === 'mobile' ? 3 : screenSize === 'tablet' ? 4 : 6;
		return filteredProjects.slice(0, limit);
	});

	// Get all required translations at once
	const translationKeys: TranslationKey[] = [
		'viewAll',
		'searchProjects',
		'noResultsFound',
		'tryAdjusting'
	];

	let t = $derived(getTranslations(global, translationKeys));

	// Generate link to projects page
	let projectsPageLink = $derived(`/${selectedLanguage}/${navigation[selectedLanguage].projects}`);

	// Handle filter updates
	const handleFilterUpdate = (newFilters: FilterState) => {
		projectsFilterStore.set(newFilters);
	};

	// Handle clear filters
	const handleClearFilters = () => {
		projectsFilterStore.reset();
	};
</script>

<div
	use:inview={options}
	oninview_change={(event) => {
		const { inView } = event.detail;
		isInView = inView;
	}}
	class="flex flex-col gap-y-10 sm:gap-y-16 2xl:gap-y-[4.5rem] {isInView ? 'animate' : 'opacity-0'}"
>
	<h2 class="text-[2.5rem] leading-none font-normal sm:text-5xl md:text-6xl 2xl:text-7xl">
		{projectsPage.title}
	</h2>

	<!-- Search and Filter Component -->
	{#if showFilters}
		<div class="relative z-10">
			<SearchFilter
				filters={$projectsFilterStore}
				{availableTags}
				showDateFilter={false}
				placeholder={t.searchProjects}
				{global}
				onUpdateFilters={handleFilterUpdate}
				onClearFilters={handleClearFilters}
			/>
		</div>
	{/if}

	{#if currentProjects && currentProjects.length > 0}
		<div class="grid grid-cols-1 gap-6 sm:gap-10 md:grid-cols-2 xl:grid-cols-3">
			{#each currentProjects as project (project.meta.id)}
				<ProjectCard
					title={project.translations[selectedLanguage].title}
					description={project.translations[selectedLanguage].description}
					thumbnail={project.meta.thumbnail}
					thumbnailPlaceholder={project.meta.thumbnailPlaceholder}
					link={'/' +
						selectedLanguage +
						'/' +
						navigation[selectedLanguage].projects +
						'/' +
						project.translations[selectedLanguage].slug}
				/>
			{/each}
		</div>

		<!-- View All Button - only show if in home page and there are more projects -->
		{#if showViewAllButton && filteredProjects.length > (screenSize === 'mobile' ? 3 : screenSize === 'tablet' ? 4 : 6)}
			<div class="flex justify-center">
				<a
					href={projectsPageLink}
					class="group flex items-center gap-3 rounded-full border border-white/10 bg-white/[.01] px-8 py-4 backdrop-blur-md transition-all duration-300 ease-in-out hover:scale-105 hover:border-white/20 hover:bg-white/[.05]"
				>
					<span class="text-lg font-medium text-gray-300">{t.viewAll}</span>
					<svg
						class="h-5 w-5 text-gray-300 transition-transform duration-300 group-hover:translate-x-1"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17 8l4 4m0 0l-4 4m4-4H3"
						/>
					</svg>
				</a>
			</div>
		{/if}
	{:else if languageFilteredProjects.length > 0}
		<!-- No results found with current filters -->
		<div class="flex flex-col items-center gap-4 py-16 text-center">
			<svg class="h-16 w-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
			<div class="text-white/60">
				<p class="text-lg">{t.noResultsFound}</p>
				<p class="mt-2 text-sm">{t.tryAdjusting}</p>
			</div>
		</div>
	{/if}
</div>
