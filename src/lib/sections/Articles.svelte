<script lang="ts">
	import ArticleCard from '$lib/components/ArticleCard.svelte';
	import { translation } from '$lib/utils';
	import { inview, type Options } from 'svelte-inview';

	let isInView = $state(false);
	const options: Options = {
		rootMargin: '-100px',
		unobserveOnEnter: true
	};

	let data = $derived($translation || { articles: [], global: { interface: [] } });
	let articles = $derived(data.articles || []);

	let noArticleText = $derived(
		data.global.interface.find((item) => item.name === 'no_article')?.value ||
			'No articles available'
	);
</script>

{#if articles && articles.length > 0}
	<div
		use:inview={options}
		oninview_change={(event) => {
			const { inView } = event.detail;
			isInView = inView;
		}}
		class="flex flex-col gap-y-10 sm:gap-y-16 2xl:gap-y-[4.5rem] {isInView
			? 'animate'
			: 'opacity-0'}"
	>
		<h2 class="text-[2.5rem] leading-none font-normal sm:text-5xl md:text-6xl 2xl:text-7xl">
			{articles[articles.length - 1].translations[0].title}
		</h2>

		{#if articles.length > 1}
			<div class="grid grid-cols-1 gap-6 sm:gap-10 md:grid-cols-2 2xl:grid-cols-3">
				{#each articles.slice(0, -1) as article (article.id)}
					{#if article.published}
						<ArticleCard
							title={article.translations[0].title}
							excerpt={article.translations[0].excerpt}
							image={article.featured_image}
							link={'/' +
								article.translations[0].languages_code +
								'/blog/' +
								article.translations[0].slug}
							publishedDate={article.published_date}
							tags={article.translations[0].tags}
							slug={article.translations[0].slug}
						/>
					{/if}
				{/each}
			</div>
		{:else}
			<p class="py-12 text-center text-lg text-white/70">
				{noArticleText}
			</p>
		{/if}
	</div>
{/if}
