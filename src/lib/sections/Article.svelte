<script lang="ts">
	import { inview, type Options } from 'svelte-inview';
	import type { ArticleSectionProps } from '$lib/types';
	import OptimizedImage from '$lib/components/OptimizedImage.svelte';
	import { getTranslation } from '$lib/utils/translations';
	import { ChevronLeft } from '@lucide/svelte';
	import ContentRenderer from '$lib/components/ui/ContentRenderer.svelte';

	// Receive props from parent
	let { content, currentLang, global }: ArticleSectionProps = $props();

	// Get translation with type safety
	let backText = $derived(getTranslation(global, 'back'));

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
			<ChevronLeft class="h-6 w-6 text-gray-100" style="margin-bottom: -0.1rem;" />
			<span class="hover:underline">{backText}</span>
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
			{#if content.meta.featured_image || content.meta.featuredImagePlaceholder}
				<div class="w-full">
					<OptimizedImage
						src={content.meta.featured_image}
						alt={currentTranslation.title}
						cssClass="aspect-video rounded-3xl"
						showPlaceholder={content.meta.featuredImagePlaceholder || false}
						sizes="100vw"
					/>
				</div>
			{/if}

			<!-- Content -->
			{#if currentTranslation.content}
				<ContentRenderer content={currentTranslation.content} className="max-w-none" />
			{/if}
		</article>
	{/if}
</div>
