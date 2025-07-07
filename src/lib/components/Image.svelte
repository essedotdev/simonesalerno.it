<script lang="ts">
	export let src: string | undefined | null = null;
	export let alt: string = '';
	export let cssClass: string = '';
	export let showPlaceholder: boolean = false;

	const placeholderIcon = '/placeholder.svg';
</script>

<div class="relative overflow-hidden {cssClass}">
	{#if showPlaceholder}
		<div class="flex h-full w-full items-center justify-center bg-white/10 backdrop-blur-md">
			<img
				src={placeholderIcon}
				alt="Placeholder"
				class="h-12 w-12 opacity-60"
				style="filter: brightness(0) saturate(100%) invert(100%);"
			/>
		</div>
	{:else if src}
		<img {src} {alt} class="h-full w-full object-cover" />
	{/if}
</div>
