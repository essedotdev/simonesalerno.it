<script lang="ts">
	import { onMount } from 'svelte';

	export let src: string | undefined | null = null;
	export let alt: string = '';
	export let cssClass: string = '';

	let hasError = !src;
	let isLoaded = false;
	const placeholderIcon = '/placeholder.svg';

	function handleError() {
		hasError = true;
	}

	function handleLoad() {
		isLoaded = true;
	}

	$: {
		if (src) {
			hasError = false;
			isLoaded = false;
		} else {
			hasError = true;
		}
	}

	onMount(() => {
		if (!src) {
			hasError = true;
		}
	});
</script>

<div class="relative overflow-hidden {cssClass}">
	{#if hasError}
		<div
			class="flex h-full w-full items-center justify-center rounded-lg bg-white/20 backdrop-blur-md"
		>
			<img
				src={placeholderIcon}
				alt="Placeholder"
				class="h-12 w-12 opacity-60"
				style="filter: brightness(0) saturate(100%) invert(100%);"
			/>
		</div>
	{:else}
		<div
			class="absolute inset-0 flex h-full w-full items-center justify-center rounded-lg bg-white/5 backdrop-blur-md"
		>
			<img
				src={placeholderIcon}
				alt="Loading..."
				class="h-12 w-12 animate-pulse opacity-60"
				style="filter: brightness(0) saturate(100%) invert(100%);"
			/>
		</div>

		<img
			{src}
			{alt}
			on:load={handleLoad}
			on:error={handleError}
			class="relative h-full w-full object-cover transition-opacity duration-300 {isLoaded
				? 'opacity-100'
				: 'opacity-0'}"
		/>
	{/if}
</div>
