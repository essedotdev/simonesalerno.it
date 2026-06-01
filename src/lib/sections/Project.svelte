<script lang="ts">
	import { base } from '$app/paths';
	import OptimizedImage from '$lib/components/OptimizedImage.svelte';
	import ContentRenderer from '$lib/components/ui/ContentRenderer.svelte';
	import type { ProjectSectionProps } from '$lib/types';
	import { getTranslation, translateTags } from '$lib/utils/translations';
	import { ChevronLeft, ExternalLink } from '@lucide/svelte';
	import { inview, type Options } from 'svelte-inview';

	// Receive props from parent
	let { content, currentLang, global, navigation }: ProjectSectionProps = $props();

	// Get translation with type safety
	let backText = $derived(getTranslation(global, 'back'));

	let isInView = $state(false);
	const options: Options = {
		rootMargin: '-100px',
		unobserveOnEnter: true
	};

	let homeUrl = $derived(`${base}${currentLang === 'en' ? '/' : `/${currentLang}`}`);
	let currentTranslation = $derived(content.translations[currentLang]);
	let projectsRoute = $derived(navigation?.[currentLang]?.projects ?? 'projects');
	// Coppie {raw, label}: link sul tag grezzo (il filtro confronta i raw), testo tradotto.
	let tagLinks = $derived(
		(currentTranslation?.tags ?? []).map((raw) => ({
			raw,
			label: translateTags(global, [raw])[0] ?? raw
		}))
	);
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
		<div class="flex flex-col gap-y-6 xl:flex-row xl:gap-x-14">
			<div class="w-full xl:w-1/2">
				{#if content.meta.featured_image || content.meta.featuredImagePlaceholder}
					<OptimizedImage
						src={content.meta.featured_image}
						alt={currentTranslation.title}
						className="aspect-video rounded-3xl"
						showPlaceholder={Boolean(content.meta.featuredImagePlaceholder)}
						sizes="(max-width: 1280px) 100vw, 50vw"
					/>
				{/if}
			</div>
			<div class="flex w-full flex-col gap-y-6 xl:w-1/2">
				<h2 class="text-5xl font-normal sm:text-6xl 2xl:text-7xl">
					{currentTranslation.title}
				</h2>

				{#if currentTranslation.excerpt}
					<div class="text-2xl italic">
						<p>{currentTranslation.excerpt}</p>
					</div>
				{/if}

				{#if content.meta.link}
					<a
						href={content.meta.link}
						class="flex w-min items-center gap-x-2 text-2xl underline"
						data-sveltekit-reload
					>
						<ExternalLink class="h-6 w-6" />
						{content.meta.link}
					</a>
				{/if}

				{#if tagLinks.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each tagLinks as tag (tag.raw)}
							<a
								href={`${base}/${currentLang}/${projectsRoute}?tags=${encodeURIComponent(tag.raw)}`}
								class="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-gray-100"
							>
								{tag.label}
							</a>
						{/each}
					</div>
				{/if}

				{#if currentTranslation.content}
					<ContentRenderer content={currentTranslation.content} className="flex flex-col gap-y-4" />
				{/if}
			</div>
		</div>
	{/if}
</div>
