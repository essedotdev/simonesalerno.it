<script lang="ts">
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import { inview, type Options } from 'svelte-inview';
	import { get } from 'svelte/store';
	import { translation } from '$lib/utils';

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
	class="flex flex-col gap-y-14 sm:gap-y-16 2xl:gap-y-[4.5rem] {isInView ? 'animate' : 'opacity-0'}"
>
	<h2 class="text-5xl font-normal sm:text-6xl 2xl:text-7xl">
		{data.projects[0].translations[0].title}
	</h2>

	<div class="grid grid-cols-1 gap-6 sm:gap-10 md:grid-cols-2 2xl:grid-cols-3">
		{#each data.projects.slice(1) as project}
			<ProjectCard
				title={project.translations[0].title}
				description={project.translations[0].description}
				image={project.images[0].directus_files_id}
				link={data.projects[0].translations[0].languages_code +
					'/' +
					data.projects[0].translations[0].name +
					'/' +
					project.translations[0].name}
			/>
		{/each}
	</div>
</div>
