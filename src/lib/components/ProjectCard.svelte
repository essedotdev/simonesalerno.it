<script lang="ts">
	import type { ProjectCardProps } from '$lib/types';
	import Image from './Image.svelte';

	let { title, description, thumbnail, thumbnailPlaceholder, link, tags }: ProjectCardProps =
		$props();
</script>

<div
	class="rounded-3xl border border-white/10 bg-white/[.01] backdrop-blur-md transition-all duration-300 ease-in-out hover:scale-105 hover:rotate-1"
>
	<a href={link}>
		<Image
			src={thumbnail}
			alt={title}
			cssClass="aspect-video rounded-t-3xl"
			showPlaceholder={thumbnailPlaceholder}
		/>
	</a>
	<div class="px-6 py-5">
		<a href={link}>
			<h5 class="mb-2 text-2xl font-medium text-gray-100">
				{title}
			</h5>
		</a>

		<p class="mb-3 text-base text-gray-300 lg:text-xl">
			{description}
		</p>

		{#if tags && tags.length > 0}
			<div class="flex flex-wrap items-center gap-2">
				{#each tags.slice(0, 3) as tag (tag)}
					<span class="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400">
						{tag}
					</span>
				{/each}
				{#if tags.length > 3}
					<span
						class="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-xs text-gray-400"
					>
						+{tags.length - 3}
					</span>
				{/if}
			</div>
		{/if}
	</div>
</div>
