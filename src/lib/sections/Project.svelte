<script lang="ts">
	import Link from '$lib/components/icons/Link.svelte';
	import { inview, type Options } from 'svelte-inview';
	import type { ProjectSectionProps } from '$lib/types';
	import Image from '$lib/components/Image.svelte';

	// Receive props from parent
	let { content, currentLang, global }: ProjectSectionProps = $props();
	
	// Derive back text from global
	let backText = $derived(
		global?.interface?.find((item: any) => item.name === 'back')?.value
	);

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
						<span class="-mb-[0.2rem]"><Link /></span>
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
