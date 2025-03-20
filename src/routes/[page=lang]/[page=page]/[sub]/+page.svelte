<script lang="ts">
	import Project from '$lib/sections/Project.svelte';
	import { translation } from '$lib/utils';
	import { get } from 'svelte/store';

	const data = get(translation);
</script>

<svelte:head>
	<title>Simone Salerno • {data.projects[0].translations[0].title}</title>
</svelte:head>

<div class="px-4 pt-8 pb-52 sm:px-8 sm:pt-10 sm:pb-64 lg:px-14 2xl:pt-14 2xl:pb-72">
	<Project />
</div>
