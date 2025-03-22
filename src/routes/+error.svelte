<script lang="ts">
	import { page } from '$app/state';
	import { translation } from '$lib/utils';
	import { get } from 'svelte/store';

	const data = get(translation);
</script>

<div class="flex min-h-[80vh] flex-col items-center justify-center">
	<h1 class="text-9xl font-bold">{page.status}</h1>
	<p class="mt-2 text-4xl">{data.global.interface.find((item) => item.name === '404')?.value}</p>
	<a data-sveltekit-reload href="/" class="mt-8 flex items-center gap-x-1 text-2xl hover:underline">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			style="fill: #f3f4f6;transform: ;msFilter:;margin-bottom: -0.2rem;"
			><path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z"></path></svg
		>
		{data.global.interface.find((item) => item.name === 'back_home')?.value}
	</a>
</div>
