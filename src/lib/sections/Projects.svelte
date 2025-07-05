<script lang="ts">
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import { translation } from '$lib/utils';
	import { inview, type Options } from 'svelte-inview';

	let isInView = $state(false);
	const options: Options = {
		rootMargin: '-100px',
		unobserveOnEnter: true
	};

	let data = $derived(
		$translation || { projects: [] }
	);
</script>

<div
	use:inview={options}
	oninview_change={(event) => {
		const { inView } = event.detail;
		isInView = inView;
	}}
	class="flex flex-col gap-y-10 sm:gap-y-16 2xl:gap-y-[4.5rem] {isInView ? 'animate' : 'opacity-0'}"
>
	{#if data.projects && data.projects.length > 0}
		<h2 class="text-[2.5rem] leading-none font-normal sm:text-5xl md:text-6xl 2xl:text-7xl">
			{data.projects[0].translations[0].title}
		</h2>

		<div class="grid grid-cols-1 gap-6 sm:gap-10 md:grid-cols-2 2xl:grid-cols-3">
			{#each data.projects.slice(1) as project (project.id)}
				<ProjectCard
					title={project.translations[0].title}
					description={project.translations[0].description}
					image={project.images?.[0]?.directus_files_id || ''}
					link={'/' +
						project.translations[0].languages_code +
						'/' +
						(data.projects[0].translations[0].slug || 'projects') +
						'/' +
						(project.translations[0].slug || 'project')}
					slug={project.translations[0].slug || 'project'}
				/>
			{/each}
		</div>
	{/if}
</div>
