<script lang="ts">
	import ArticleCard from '$lib/components/ArticleCard.svelte';
	import SearchFilter from '$lib/components/SearchFilter.svelte';
	import { articlesFilterStore } from '$lib/stores/filterStore';
	import type { ArticlesSectionProps } from '$lib/types/content';
	import { applyFilters, extractTags } from '$lib/utils/searchUtils';
	import type { FilterState } from '$lib/utils/types';
	import { inview, type Options } from 'svelte-inview';

	// Receive data as props
	let {
		articles,
		selectedLanguage,
		navigation,
		blogPage,
		showFilters = false,
		showViewAllButton = false,
		global
	}: ArticlesSectionProps = $props();

	let isInView = $state(false);
	const options: Options = {
		rootMargin: '-100px',
		unobserveOnEnter: true
	};

	// Filter articles that have translation for current language
	let languageFilteredArticles = $derived(
		articles.filter((article) => article.translations[selectedLanguage])
	);

	// Extract available tags for the current language
	let availableTags = $derived(extractTags(languageFilteredArticles, selectedLanguage));

	// Apply search filters only if showFilters is enabled
	let filteredArticles = $derived(
		showFilters
			? applyFilters(languageFilteredArticles, $articlesFilterStore, selectedLanguage, 'articles')
			: languageFilteredArticles
	);

	// Limit articles to 3 if showViewAllButton is enabled (home page)
	let currentArticles = $derived(
		showViewAllButton ? filteredArticles.slice(0, 3) : filteredArticles
	);

	// Get view all button text from global interface
	let viewAllText = $derived(
		global?.interface?.find((item) => item.name === 'viewAll')?.value
	);

	// Generate link to blog page
	let blogPageLink = $derived(`/${selectedLanguage}/${navigation[selectedLanguage].articles}`);

	// Handle filter updates
	const handleFilterUpdate = (newFilters: FilterState) => {
		articlesFilterStore.set(newFilters);
	};

	// Handle clear filters
	const handleClearFilters = () => {
		articlesFilterStore.reset();
	};

	// Derive search placeholder from global
	let searchArticlesText = $derived(
		global?.interface?.find((item) => item.name === 'searchArticles')?.value
	);
	
	// Derive error messages from global
	let noResultsFoundText = $derived(
		global?.interface?.find((item) => item.name === 'noResultsFound')?.value
	);
	let tryAdjustingText = $derived(
		global?.interface?.find((item) => item.name === 'tryAdjusting')?.value
	);
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
		{blogPage.title}
	</h2>

	<!-- Search and Filter Component -->
	{#if showFilters}
		<div class="relative z-10">
			<SearchFilter
				filters={$articlesFilterStore}
				{availableTags}
				showDateFilter={true}
				placeholder={searchArticlesText}
				{global}
				onUpdateFilters={handleFilterUpdate}
				onClearFilters={handleClearFilters}
			/>
		</div>
	{/if}

	{#if currentArticles && currentArticles.length > 0}
		<div class="grid grid-cols-1 gap-6 sm:gap-10 md:grid-cols-2 xl:grid-cols-3">
			{#each currentArticles as article (article.meta.id)}
				<ArticleCard
					title={article.translations[selectedLanguage].title}
					excerpt={article.translations[selectedLanguage].excerpt}
					featuredImage={article.meta.featured_image}
					featuredImagePlaceholder={article.meta.featuredImagePlaceholder}
					link={'/' +
						selectedLanguage +
						'/' +
						navigation[selectedLanguage].articles +
						'/' +
						article.translations[selectedLanguage].slug}
					publishedDate={article.meta.published_date}
					tags={article.translations[selectedLanguage].tags}
				/>
			{/each}
		</div>

		<!-- View All Button - only show if in home page and there are more articles -->
		{#if showViewAllButton && filteredArticles.length > 3}
			<div class="flex justify-center">
				<a
					href={blogPageLink}
					class="group flex items-center gap-3 rounded-full border border-white/10 bg-white/[.01] px-8 py-4 backdrop-blur-md transition-all duration-300 ease-in-out hover:scale-105 hover:border-white/20 hover:bg-white/[.05]"
				>
					<span class="text-lg font-medium text-gray-300">{viewAllText}</span>
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
	{:else if languageFilteredArticles.length > 0}
		<!-- No results found with current filters -->
		<div class="flex flex-col items-center gap-4 py-16 text-center">
			<svg class="h-16 w-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
			<div class="text-white/60">
				<p class="text-lg">{noResultsFoundText}</p>
				<p class="mt-2 text-sm">{tryAdjustingText}</p>
			</div>
		</div>
	{/if}
</div>
