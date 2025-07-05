<script lang="ts">
	let {
		title,
		excerpt,
		image,
		link,
		publishedDate,
		tags,
		slug
	}: {
		title: string;
		excerpt: string;
		image?: string;
		link: string;
		publishedDate: string;
		tags: string[];
		slug: string;
	} = $props();

	// Format date for display
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};
</script>

<div
	class="rounded-3xl border border-white/10 bg-white/[.01] backdrop-blur-md transition-all duration-300 ease-in-out hover:scale-105 hover:rotate-1"
>
	{#if image}
		<a href={link}>
			<img
				loading="lazy"
				class="aspect-video rounded-t-3xl object-cover"
				src="https://directus.simonesalerno.it/assets/{image}/{slug}.jpg"
				alt={title}
			/>
		</a>
	{/if}
	<div class="px-6 py-5">
		<div class="mb-3 text-sm text-gray-400">
			{formatDate(publishedDate)}
		</div>

		<a href={link}>
			<h5 class="mb-2 text-2xl font-medium text-gray-100">
				{title}
			</h5>
		</a>

		<p class="mb-3 text-base text-gray-300 lg:text-xl">
			{excerpt}
		</p>

		{#if tags && tags.length > 0}
			<div class="flex flex-wrap gap-2">
				{#each tags as tag (tag)}
					<span class="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400">
						{tag}
					</span>
				{/each}
			</div>
		{/if}
	</div>
</div>
