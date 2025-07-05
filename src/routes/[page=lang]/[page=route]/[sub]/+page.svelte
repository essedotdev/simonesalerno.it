<script lang="ts">
	import Project from '$lib/sections/Project.svelte';
	import Article from '$lib/sections/Article.svelte';

	let { data } = $props();

	// Reattivo con Svelte 5 runes - ora i dati sono direttamente disponibili
	let pageTitle = $derived(
		data.type === 'project'
			? data.project?.translations[0]?.title || ''
			: data.article?.translations[0]?.title || ''
	);
</script>

<svelte:head>
	<title>Simone Salerno • {pageTitle}</title>
</svelte:head>

<div class="px-4 pt-8 pb-52 sm:px-8 sm:pt-10 sm:pb-64 lg:px-14 2xl:pt-14 2xl:pb-72">
	{#if data.type === 'project'}
		<Project project={data.project} currentLang={data.currentLang} />
	{:else if data.type === 'article'}
		<Article article={data.article} currentLang={data.currentLang} />
	{/if}
</div>
