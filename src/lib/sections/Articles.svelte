<script lang="ts">
	import ArticleCard from '$lib/components/ArticleCard.svelte';
	import { inview, type Options } from 'svelte-inview';
	import type { ArticlesSectionProps } from '$lib/types';

	// Receive data as props
	let { articles, selectedLanguage, navigation, blogPage }: ArticlesSectionProps = $props();

	let isInView = $state(false);
	const options: Options = {
		rootMargin: '-100px',
		unobserveOnEnter: true
	};

	// Filter articles that have translation for current language
	let currentArticles = $derived(
		articles.filter((article) => article.translations[selectedLanguage])
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
	{/if}
</div>
