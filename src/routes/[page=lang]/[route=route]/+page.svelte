<script lang="ts">
	import Articles from '$lib/sections/Articles.svelte';
	import Projects from '$lib/sections/Projects.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<section class="mx-auto max-w-screen-2xl px-4 pt-20 pb-32 sm:px-8 sm:pt-32 sm:pb-44 lg:px-14">
	{#if data.pageType === 'projects'}
		<Projects
			projects={data.projects}
			selectedLanguage={data.selectedLanguage}
			navigation={data.navigation}
			projectsPage={data.projectsPage}
			showFilters={true}
		/>
	{:else}
		<Articles
			articles={data.articles}
			selectedLanguage={data.selectedLanguage}
			navigation={data.navigation}
			blogPage={data.blogPage}
			showFilters={true}
		/>
	{/if}
</section>
