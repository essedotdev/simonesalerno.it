<script lang="ts">
	import AboutSection from '$lib/sections/About.svelte';
	import ArticlesSection from '$lib/sections/Articles.svelte';
	import ContactSection from '$lib/sections/Contact.svelte';
	import ProjectsSection from '$lib/sections/Projects.svelte';
	import WelcomeSection from '$lib/sections/Welcome.svelte';
	import { translation } from '$lib/utils';

	function sanitizeId(link: string): string {
		return link.startsWith('#') ? link.slice(1) : link;
	}

	let data = $derived($translation || { global: { title: '', navigation: [] } });
</script>

<svelte:head>
	<title>Simone Salerno • {data.global.title}</title>
</svelte:head>

<div
	id="top"
	class="flex min-h-[80vh] items-center justify-center border-b border-white/5 px-4 sm:px-8 lg:px-14"
>
	<WelcomeSection />
</div>

<div
	id={sanitizeId(data.global.navigation[0]?.link || '#')}
	class="px-4 pt-20 pb-24 sm:px-8 sm:pt-28 sm:pb-32 lg:px-14 2xl:py-36"
>
	<ProjectsSection />
</div>

<div
	id={sanitizeId(data.global.navigation[1]?.link || '#')}
	class="border-t border-white/5 pt-20 pb-24 sm:px-8 sm:pt-28 sm:pb-32 lg:px-14 2xl:py-36"
>
	<ArticlesSection />
</div>

<div
	id={sanitizeId(data.global.navigation[2]?.link || '#')}
	class="border-t border-white/5 px-4 pt-20 pb-24 sm:px-8 sm:pt-28 sm:pb-32 lg:px-14 2xl:py-36"
>
	<AboutSection />
</div>

<div
	id={sanitizeId(data.global.navigation[3]?.link || '#')}
	class="border-t border-white/5 px-4 pt-20 pb-24 sm:px-8 sm:pt-28 sm:pb-32 lg:px-14 2xl:py-36"
>
	<ContactSection />
</div>
