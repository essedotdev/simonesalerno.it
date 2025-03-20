<script lang="ts">
	import { translation } from '$lib/utils';
	import { inview, type Options } from 'svelte-inview';
	import { get } from 'svelte/store';

	let isInView: boolean;
	const options: Options = {
		rootMargin: '-100px',
		unobserveOnEnter: true
	};

	const data = get(translation);
</script>

<div
	use:inview={options}
	on:inview_change={(event) => {
		const { inView } = event.detail;
		isInView = inView;
	}}
	class="flex flex-col gap-y-10 sm:gap-y-16 2xl:gap-y-[4.5rem] {isInView ? 'animate' : 'opacity-0'}"
>
	<h2 class="text-[2.5rem] leading-none font-normal sm:text-5xl md:text-6xl 2xl:text-7xl">
		{data.about.title}
	</h2>
	<div
		class="flex flex-col gap-y-4 text-xl sm:text-2xl lg:gap-y-6 lg:text-[1.7rem] 2xl:gap-y-8 2xl:text-3xl"
	>
		{#each data.about.description.blocks as paragraph}
			<p>{paragraph.data.text}</p>
		{/each}
	</div>
</div>
