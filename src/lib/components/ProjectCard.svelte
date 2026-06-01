<script lang="ts">
	import { base } from '$app/paths';
	import type { ProjectCardProps } from '$lib/types';
	import OptimizedImage from './OptimizedImage.svelte';

	let {
		title,
		excerpt,
		featuredImage,
		featuredImagePlaceholder,
		link,
		tags,
		status,
		statusLabel
	}: ProjectCardProps = $props();

	// Colori del badge di stato (coerenti col tema scuro/glassy)
	const STATUS_STYLE: Record<NonNullable<ProjectCardProps['status']>, string> = {
		completed: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/25',
		'in-progress': 'bg-amber-500/15 text-amber-200 border-amber-400/25',
		idea: 'bg-violet-500/15 text-violet-200 border-violet-400/25',
		archived: 'bg-white/10 text-gray-300 border-white/15'
	};
</script>

<div
	class="rounded-3xl border border-white/10 bg-white/1 backdrop-blur-md transition-all duration-300 ease-in-out hover:scale-105 hover:rotate-1"
>
	<a href={`${base}${link}`} class="relative block">
		<OptimizedImage
			src={featuredImage}
			alt={title}
			className="aspect-video rounded-t-3xl saturate-[0.8] hover:saturate-100 transition-all duration-300 ease-in-out"
			showPlaceholder={Boolean(featuredImagePlaceholder)}
			sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
		/>
		{#if status && statusLabel}
			<span
				class="absolute top-3 left-3 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-md {STATUS_STYLE[
					status
				]}"
			>
				{statusLabel}
			</span>
		{/if}
	</a>
	<div class="px-6 py-5">
		<a href={`${base}${link}`}>
			<h5 class="mb-2 text-2xl font-medium text-gray-100">
				{title}
			</h5>
		</a>

		<p class="mb-3 text-base text-gray-300 lg:text-xl">
			{excerpt}
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
