<script lang="ts">
	import { inview, type Options } from 'svelte-inview';
	import type { ArticleSectionProps } from '$lib/types';

	// Receive props from parent
	let { content, currentLang }: ArticleSectionProps = $props();

	let isInView = $state(false);
	const options: Options = {
		rootMargin: '-100px',
		unobserveOnEnter: true
	};

	let homeUrl = $derived(currentLang === 'en' ? '/' : `/${currentLang}`);
	let currentTranslation = $derived(content.translations[currentLang]);

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
			<span class="hover:underline">Back</span>
		</a>
	</div>

	{#if content && currentTranslation}
		<article class="flex flex-col gap-y-8">
			<!-- Header with title and meta -->
			<header class="flex flex-col gap-y-4">
				<h1 class="text-5xl font-normal sm:text-6xl 2xl:text-7xl">
					{currentTranslation.title}
				</h1>

				<div class="flex flex-col gap-y-2 text-xl text-gray-400">
					<time datetime={content.meta.published_date}>
						{formatDate(content.meta.published_date, currentLang)}
					</time>

					{#if currentTranslation.excerpt}
						<p class="text-2xl text-gray-300 italic">
							{currentTranslation.excerpt}
						</p>
					{/if}
				</div>

				{#if currentTranslation.tags && currentTranslation.tags.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each currentTranslation.tags as tag (tag)}
							<span class="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300">
								{tag}
							</span>
						{/each}
					</div>
				{/if}
			</header>

			<!-- Featured image if available -->
			{#if content.meta.featured_image}
				<div class="w-full">
					<img
						class="h-full w-full rounded-3xl object-cover"
						src={content.meta.featured_image}
						alt={currentTranslation.title}
					/>
				</div>
			{/if}

			<!-- Content -->
			{#if currentTranslation.content}
				<div class="prose prose-lg prose-invert max-w-none">
					{#each currentTranslation.content.blocks as block (block)}
						{#if block.type === 'paragraph'}
							<p class="text-2xl leading-relaxed">{block.data.text}</p>
						{:else if block.type === 'header'}
							<h2 class="mt-8 mb-4 text-4xl font-semibold">{block.data.text}</h2>
						{:else if block.type === 'list'}
							<ul class="text-2xl">
								{#each block.data.items || [] as item (item)}
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
