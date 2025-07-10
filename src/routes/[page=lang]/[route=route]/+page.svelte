<script lang="ts">
	import Articles from '$lib/sections/Articles.svelte';
	import Projects from '$lib/sections/Projects.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<section
	class="xs:pt-20 xs:pb-32 mx-auto max-w-screen-2xl px-4 pt-14 pb-24 sm:px-8 sm:pt-28 sm:pb-44 lg:px-14"
>
	{#if data.pageType === 'projects'}
		<Projects
			projects={data.items}
			selectedLanguage={data.currentLang}
			navigation={data.navigation}
			projectsPage={data.projectsPage}
			showFilters={true}
			global={data.global}
			pagination={data.pagination}
			activeFilters={data.activeFilters}
			availableTags={data.availableTags}
		/>
	{:else}
		<Articles
			articles={data.items}
			selectedLanguage={data.currentLang}
			navigation={data.navigation}
			blogPage={data.blogPage}
			showFilters={true}
			global={data.global}
			pagination={data.pagination}
			activeFilters={data.activeFilters}
			availableTags={data.availableTags}
		/>
	{/if}
</section>
