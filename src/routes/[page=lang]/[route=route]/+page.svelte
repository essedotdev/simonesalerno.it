<script lang="ts">
	import Projects from '$lib/sections/Projects.svelte';
	import Articles from '$lib/sections/Articles.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	{#if data.pageType === 'projects'}
		<title>{data.projectsPage.title} - {data.global.title}</title>
		<meta name="description" content={data.global.description} />
	{:else}
		<title>{data.blogPage.title} - {data.global.title}</title>
		<meta name="description" content={data.global.description} />
	{/if}
</svelte:head>

<section class="mx-auto max-w-screen-xl px-5 pt-20 pb-32 sm:px-8 md:px-12 md:pt-32 md:pb-44">
	{#if data.pageType === 'projects'}
		<Projects
			projects={data.projects}
			selectedLanguage={data.selectedLanguage}
			navigation={data.navigation}
			projectsPage={data.projectsPage}
		/>
	{:else}
		<Articles
			articles={data.articles}
			selectedLanguage={data.selectedLanguage}
			navigation={data.navigation}
			blogPage={data.blogPage}
		/>
	{/if}
</section>
