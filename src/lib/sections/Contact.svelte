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
	class="flex w-full flex-col justify-between gap-y-14 tracking-tight sm:gap-y-24 {isInView
		? 'animate'
		: 'opacity-0'}"
>
	<div class="flex flex-col gap-y-4 sm:gap-y-6">
		<h3 class="text-[2.5rem] leading-none font-normal sm:text-5xl md:text-6xl 2xl:text-7xl">
			{data.contact.title}
		</h3>
		<p class="text-xl sm:text-2xl md:text-[1.7rem] xl:text-3xl">
			{data.contact.subtitle}
		</p>
	</div>

	<div class="flex flex-col gap-y-2 text-xl sm:text-2xl">
		{#each data.contact.links as link, index}
			<a
				class="group flex transition-all duration-300 ease-in-out
					{index === 0 ? 'mb-2 text-2xl sm:text-3xl md:text-4xl' : ''}"
				href={link.link}
				target="_blank"
			>
				<span
					class="bg-gradient-to-r from-gray-300 to-gray-300 bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-all duration-500 ease-out group-hover:bg-[length:100%_2px]"
				>
					{link.name}
				</span>
			</a>
		{/each}
	</div>
</div>
