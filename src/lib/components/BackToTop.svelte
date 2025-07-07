<script lang="ts">
	interface Props {
		global?: any;
	}
	
	let { global }: Props = $props();
	
	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	};
	
	// Derive back to top text from global
	let backToTopText = $derived(
		global?.interface?.find((item: any) => item.name === 'backToTop')?.value
	);
</script>

<button
	on:click={scrollToTop}
	class="fixed right-8 bottom-8 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[.01] backdrop-blur-md transition-all duration-300 ease-in-out hover:scale-110 hover:bg-white/[.05]"
	aria-label={backToTopText}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="text-gray-300"
	>
		<path d="m18 15-6-6-6 6" />
	</svg>
</button>
