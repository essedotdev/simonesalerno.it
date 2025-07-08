<script lang="ts">
	import { ExternalLink, ChevronLeft } from '@lucide/svelte';
	import { inview, type Options } from 'svelte-inview';
	import type { ProjectSectionProps } from '$lib/types';
	import Image from '$lib/components/Image.svelte';
	import { getTranslation } from '$lib/utils/translations';

	// Receive props from parent
	let { content, currentLang, global }: ProjectSectionProps = $props();

	// Get translation with type safety
	let backText = $derived(getTranslation(global, 'back'));

	let isInView = $state(false);
	const options: Options = {
		rootMargin: '-100px',
		unobserveOnEnter: true
	};

	let homeUrl = $derived(currentLang === 'en' ? '/' : `/${currentLang}`);
	let currentTranslation = $derived(content.translations[currentLang]);
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
				{#if (content.meta.images && content.meta.images.length > 0) || content.meta.thumbnailPlaceholder}
					<Image
						src={content.meta.images?.[0]}
						alt={currentTranslation.title}
						cssClass="aspect-video rounded-3xl"
						showPlaceholder={content.meta.thumbnailPlaceholder || false}
					/>
				{/if}
			</div>
			<div class="flex w-full flex-col gap-y-6 xl:w-1/2">
				<h2 class="text-5xl font-normal sm:text-6xl 2xl:text-7xl">
					{currentTranslation.title}
				</h2>

				{#if currentTranslation.description}
					<div class="text-2xl italic">
						<p>{currentTranslation.description}</p>
					</div>
				{/if}

				{#if content.meta.link}
					<a href={content.meta.link} class="flex w-min items-center gap-x-2 text-2xl underline">
						<ExternalLink class="h-6 w-6" />
						{content.meta.link}
					</a>
				{/if}

				{#if currentTranslation.body}
					<div class="flex flex-col gap-y-4 text-2xl">
						{#each currentTranslation.body.blocks as paragraph (paragraph.data.text)}
							<p>{paragraph.data.text}</p>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
