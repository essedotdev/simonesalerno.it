<script lang="ts">
	import { translation } from '$lib/utils';
	import { inview, type Options } from 'svelte-inview';
	import { get } from 'svelte/store';

	let isInView: boolean;
	const options: Options = {
		rootMargin: '-50px',
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
	class="relative flex flex-col items-center {isInView ? 'animate' : 'opacity-0'}"
>
	<div class="mb-12 overflow-hidden">
		<h1 class="title {isInView ? 'slide-in' : ''}">
			{data.welcome.title}
		</h1>
	</div>

	<!-- <div class="flex text-3xl lg:text-5xl italic">
		{#await import('$lib/components/Typewriter.svelte')}
			<span>Loading...</span>
		{:then c}
			<svelte:component this={c.default} text={data.welcome.typewriter} />
		{/await}
	</div> -->

	<div class="description">
		{#each data.welcome.description.blocks as paragraph}
			<p>{@html paragraph.data.text}</p>
		{/each}
	</div>
</div>
