<script lang="ts">
	import { translation } from '$lib/utils';
	import { inview, type Options } from 'svelte-inview';

	let { article, currentLang } = $props();

	let isInView = $state(false);
	const options: Options = {
		rootMargin: '-100px',
		unobserveOnEnter: true
	};

	let data = $derived($translation || { global: { interface: [] } });
	let backText = $derived(
		data.global.interface.find((item) => item.name === 'back')?.value || 'back'
	);
	let homeUrl = $derived(currentLang === 'en' ? '/' : `/${currentLang}`);

	function formatDate(dateString: string, lang: string): string {
		const date = new Date(dateString);
		const options: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		};
		return date.toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US', options);
	}
</script>

<div
	use:inview={options}
	oninview_change={(event) => {
		const { inView } = event.detail;
		isInView = inView;
	}}
	class={isInView ? 'animate' : 'opacity-0'}
>
	<div class="flex pb-10 text-2xl 2xl:pb-14">
		<a href={homeUrl} class="flex items-center gap-x-[0.15rem]">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				style="fill: #f3f4f6;transform: ;msFilter:;margin-bottom: -0.1rem;"
				><path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z"
				></path></svg
			>
			<span class="hover:underline">{backText}</span>
		</a>
	</div>

	{#if article}
		<article class="flex flex-col gap-y-8">
			<!-- Header with title and meta -->
			<header class="flex flex-col gap-y-4">
				<h1 class="text-5xl font-normal sm:text-6xl 2xl:text-7xl">
					{article.translations[0].title}
				</h1>

				<div class="flex flex-col gap-y-2 text-xl text-gray-400">
					<time datetime={article.published_date}>
						{formatDate(article.published_date, currentLang)}
					</time>

					{#if article.translations[0].excerpt}
						<p class="text-2xl text-gray-300 italic">
							{article.translations[0].excerpt}
						</p>
					{/if}
				</div>

				{#if article.translations[0].tags && article.translations[0].tags.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each article.translations[0].tags as tag (tag)}
							<span class="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300">
								{tag}
							</span>
						{/each}
					</div>
				{/if}
			</header>

			<!-- Featured image if available -->
			{#if article.featured_image}
				<div class="w-full">
					<img
						class="h-full w-full rounded-3xl object-cover"
						src={'https://directus.simonesalerno.it/assets/' +
							article.featured_image +
							'/' +
							article.translations[0].slug +
							'.jpg'}
						alt={article.translations[0].title}
					/>
				</div>
			{/if}

			<!-- Content -->
			{#if article.translations[0].content}
				<div class="prose prose-lg prose-invert max-w-none">
					{#each article.translations[0].content.blocks as block (block)}
						{#if block.type === 'paragraph'}
							<p class="text-2xl leading-relaxed">{block.data.text}</p>
						{:else if block.type === 'header'}
							<h2 class="mt-8 mb-4 text-4xl font-semibold">{block.data.text}</h2>
						{:else if block.type === 'list'}
							<ul class="text-2xl">
								{#each block.data.items as item (item)}
									<li>{item}</li>
								{/each}
							</ul>
						{:else}
							<p class="text-2xl leading-relaxed">{block.data.text}</p>
						{/if}
					{/each}
				</div>
			{/if}
		</article>
	{/if}
</div>
