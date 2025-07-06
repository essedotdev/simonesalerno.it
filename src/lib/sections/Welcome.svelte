<script lang="ts">
	import { inview, type Options } from 'svelte-inview';
	import type { WelcomeSectionProps } from '$lib/types';

	// Receive welcome data as props
	let { welcome }: WelcomeSectionProps = $props();

	let isInView = $state(false);
	const options: Options = {
		rootMargin: '-50px',
		unobserveOnEnter: true
	};
</script>

<div
	use:inview={options}
	oninview_change={(event) => {
		const { inView } = event.detail;
		isInView = inView;
	}}
	class="relative flex flex-col items-center {isInView ? 'animate' : 'opacity-0'}"
>
	<div class="mb-12 overflow-hidden">
		<h1
			class="-mt-2 text-center text-[4rem] leading-[1.1] font-medium tracking-tight sm:text-[7rem] lg:-mt-3 xl:-mt-4 xl:text-[8rem] 2xl:-mt-6 2xl:text-[10rem] {isInView
				? 'slide-in'
				: ''}"
		>
			{welcome.title}
		</h1>
	</div>

	<!-- <div class="flex text-3xl lg:text-5xl italic">
		{#await import('$lib/components/Typewriter.svelte')}
			<span>Loading...</span>
		{:then c}
			<svelte:component this={c.default} text={welcome.typewriter} />
		{/await}
	</div> -->

	<div
		class="flex flex-col gap-y-4 text-center text-lg sm:text-xl lg:text-[1.7rem] xl:gap-y-6 2xl:text-[1.8rem]"
	>
		{#each welcome.description.blocks as paragraph (paragraph.data.text)}
			<p>{@html paragraph.data.text}</p>
		{/each}
	</div>
</div>
