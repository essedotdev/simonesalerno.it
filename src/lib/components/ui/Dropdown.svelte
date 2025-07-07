<script lang="ts">
	import { browser } from '$app/environment';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		width?: string;
		maxHeight?: string;
		zIndex?: number;
		children: any;
		triggerElement?: HTMLElement; // Keep for outside click detection
	}

	let {
		isOpen,
		onClose,
		width = '16rem',
		maxHeight = '15rem',
		zIndex = 10000,
		children,
		triggerElement
	}: Props = $props();

	let dropdownElement = $state<HTMLDivElement>();

	const handleOutsideClick = (e: MouseEvent) => {
		if (
			dropdownElement &&
			!dropdownElement.contains(e.target as Node) &&
			triggerElement &&
			!triggerElement.contains(e.target as Node)
		) {
			onClose();
		}
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			onClose();
		}
	};
</script>

<svelte:window on:click={handleOutsideClick} on:keydown={handleKeydown} />

{#if isOpen && browser}
	<div
		bind:this={dropdownElement}
		class="absolute mt-2 overflow-hidden rounded-xl border border-white/10 bg-white/[.05]"
		style="top: 100%; left: 0; width: {width}; max-height: {maxHeight}; z-index: {zIndex};"
	>
		{@render children()}
	</div>
{/if}
