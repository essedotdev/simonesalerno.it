<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	// Intervallo in millisecondi tra ogni cambio di immagine
	export let intervalTime = 600;

	let showLogo1 = true;
	let interval: NodeJS.Timeout;

	function toggleLogo() {
		showLogo1 = !showLogo1;
	}

	onMount(() => {
		// Imposta l'intervallo quando il componente viene montato
		interval = setInterval(toggleLogo, intervalTime);
	});

	onDestroy(() => {
		// Pulisci l'intervallo quando il componente viene distrutto
		clearInterval(interval);
	});
</script>

<div class="flex items-end gap-x-2">
	<div class="relative h-16 w-16 sm:h-20 sm:w-20">
		<enhanced:img
			class="absolute inset-0 h-full w-full object-contain"
			src="/static/logo/logo.png"
			alt="Logo"
			class:opacity-0={!showLogo1}
			class:opacity-100={showLogo1}
		/>
		<enhanced:img
			class="absolute inset-0 h-full w-full object-contain"
			src="/static/logo/logo2.png"
			alt="Logo"
			class:opacity-0={showLogo1}
			class:opacity-100={!showLogo1}
		/>
	</div>

	<div class="-mb-[0.2rem] flex flex-col">
		<span class="text-2xl font-medium sm:text-3xl">esse</span>
		<span class="-mt-[0.45rem] text-xl text-neutral-200 sm:text-[1.3rem]">dev</span>
	</div>
</div>
