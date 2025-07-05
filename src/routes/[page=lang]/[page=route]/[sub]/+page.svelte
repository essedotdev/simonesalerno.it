<script lang="ts">
	import Project from '$lib/sections/Project.svelte';

	let { data } = $props();

	// Reattivo con Svelte 5 runes - ora i dati sono direttamente disponibili
	let pageTitle = $derived(data.project?.translations[0]?.title || '');
</script>

<svelte:head>
	<title>Simone Salerno • {pageTitle}</title>
</svelte:head>

<div class="px-4 pt-8 pb-52 sm:px-8 sm:pt-10 sm:pb-64 lg:px-14 2xl:pt-14 2xl:pb-72">
	<Project project={data.project} currentLang={data.currentLang} />
</div>
