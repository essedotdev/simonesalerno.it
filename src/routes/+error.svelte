<script lang="ts">
	import { page } from '$app/state';
	import { translation } from '$lib/utils';

	let data = $derived($translation || { global: { interface: [] } });
	let notFoundText = $derived(
		data.global.interface.find((item) => item.name === '404')?.value || 'Page Not Found'
	);
	let backHomeText = $derived(
		data.global.interface.find((item) => item.name === 'back_home')?.value || 'Back Home'
	);
</script>

<div class="flex min-h-[80vh] flex-col items-center justify-center">
	<h1 class="text-9xl font-bold">{page.status}</h1>
	<p class="mt-2 text-4xl">{notFoundText}</p>
	<a data-sveltekit-reload href="/" class="mt-8 flex items-center gap-x-1 text-2xl hover:underline">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			style="fill: #f3f4f6;transform: ;msFilter:;margin-bottom: -0.2rem;"
			><path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z"></path></svg
		>
		{backHomeText}
	</a>
</div>
