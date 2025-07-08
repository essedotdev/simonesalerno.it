<script lang="ts">
	import Typewriter from 'svelte-typewriter';

	let { text }: { text: string[] } = $props();
</script>

<div class="typewriter">
	<Typewriter mode="loop" interval={60}>
		{#each text as line (line)}
			<h2 class="flex">{line}</h2>
		{/each}
	</Typewriter>
</div>
