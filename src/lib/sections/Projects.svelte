<script lang="ts">
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import { inview, type Options } from 'svelte-inview';
	import type { ProjectsSectionProps } from '$lib/types';

	// Receive data as props
	let { projects, selectedLanguage, navigation, projectsPage }: ProjectsSectionProps = $props();

	let isInView = $state(false);
	const options: Options = {
		rootMargin: '-100px',
		unobserveOnEnter: true
	};

	// Filter projects that have translation for current language
	let currentProjects = $derived(
		projects.filter((project) => project.translations[selectedLanguage])
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
	<h2 class="text-[2.5rem] leading-none font-normal sm:text-5xl md:text-6xl 2xl:text-7xl">
		{projectsPage.title}
	</h2>

	{#if currentProjects && currentProjects.length > 0}
		<div class="grid grid-cols-1 gap-6 sm:gap-10 md:grid-cols-2 xl:grid-cols-3">
			{#each currentProjects as project (project.meta.id)}
				<ProjectCard
					title={project.translations[selectedLanguage].title}
					description={project.translations[selectedLanguage].description}
					thumbnail={project.meta.thumbnail}
					thumbnailPlaceholder={project.meta.thumbnailPlaceholder}
					link={'/' +
						selectedLanguage +
						'/' +
						navigation[selectedLanguage].projects +
						'/' +
						project.translations[selectedLanguage].slug}
				/>
			{/each}
		</div>
	{/if}
</div>
