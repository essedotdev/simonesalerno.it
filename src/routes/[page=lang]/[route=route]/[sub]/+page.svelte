<script lang="ts">
	import Project from '$lib/sections/Project.svelte';
	import Article from '$lib/sections/Article.svelte';

	let { data } = $props();
</script>


<div class="px-4 pt-8 pb-52 sm:px-8 sm:pt-10 sm:pb-64 lg:px-14 2xl:pt-14 2xl:pb-72">
	{#if data.type === 'project'}
		<Project
			content={data.content as import('$lib/types').ProjectItem}
			currentLang={data.currentLang}
		/>
	{:else if data.type === 'article'}
		<Article
			content={data.content as import('$lib/types').ArticleItem}
			currentLang={data.currentLang}
		/>
	{/if}
</div>
