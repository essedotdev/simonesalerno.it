<script lang="ts">
	import { browser } from '$app/environment';
	import type { Snippet } from 'svelte';
	import { tick } from 'svelte';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		width?: string;
		maxHeight?: string;
		zIndex?: number;
		children: Snippet;
		triggerElement?: HTMLElement;
		dropdownId?: string; // For ARIA
		triggerId?: string; // For ARIA
		role?: 'menu' | 'listbox' | 'dialog';
		enableFocusTrap?: boolean;
		autoFocus?: boolean;
	}

	let {
		isOpen,
		onClose,
		width = '16rem',
		maxHeight = '16rem',
		zIndex = 10000,
		children,
		triggerElement,
		dropdownId = 'dropdown',
		triggerId = 'trigger',
		role = 'listbox',
		enableFocusTrap = false,
		autoFocus = true
	}: Props = $props();

	let dropdownElement = $state<HTMLDivElement>();
	let position = $state({ top: '100%', left: '0', right: 'auto' });
	let isAnimating = $state(false);
	let focusableElements = $state<HTMLElement[] | null>(null);
	let lastFocusedElement = $state<HTMLElement | null>(null);

	// Calculate optimal position relative to viewport
	const calculatePosition = async () => {
		if (!dropdownElement || !triggerElement || !browser) return;

		await tick(); // Ensure DOM is updated

		const triggerRect = triggerElement.getBoundingClientRect();
		const dropdownRect = dropdownElement.getBoundingClientRect();
		const isMobile = window.innerWidth <= 768;

		const spaceBelow = window.innerHeight - triggerRect.bottom;
		const spaceAbove = triggerRect.top;
		const spaceRight = window.innerWidth - triggerRect.left;

		// Vertical positioning
		let top = '100%';
		if (spaceBelow < dropdownRect.height && spaceAbove > spaceBelow) {
			top = `-${dropdownRect.height + 8}px`;
		}

		// Horizontal positioning
		let left = '0';
		let right = 'auto';

		if (isMobile) {
			// On mobile, prevent overflow by adjusting position
			const dropdownWidth = dropdownRect.width;
			const triggerCenter = triggerRect.left + triggerRect.width / 2;
			const halfDropdownWidth = dropdownWidth / 2;

			if (triggerCenter - halfDropdownWidth < 16) {
				// Too close to left edge
				left = `${16 - triggerRect.left}px`;
			} else if (triggerCenter + halfDropdownWidth > window.innerWidth - 16) {
				// Too close to right edge
				left = 'auto';
				right = `${16 - (window.innerWidth - triggerRect.right)}px`;
			} else {
				// Center on trigger
				left = `${triggerCenter - triggerRect.left - halfDropdownWidth}px`;
			}
		} else {
			// Desktop positioning
			if (spaceRight < dropdownRect.width) {
				left = 'auto';
				right = '0';
			}
		}

		position = { top, left, right };
	};

	// Handle focus trap
	const trapFocus = (e: KeyboardEvent) => {
		if (!enableFocusTrap || !focusableElements || focusableElements.length === 0) return;

		if (e.key === 'Tab') {
			const first = focusableElements[0];
			const last = focusableElements[focusableElements.length - 1];

			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	};

	// Enhanced keyboard navigation
	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			e.preventDefault();
			e.stopPropagation();
			onClose();
			// Use lastFocusedElement instead of triggerElement to ensure correct focus return
			if (lastFocusedElement) {
				lastFocusedElement.focus();
			} else if (triggerElement) {
				triggerElement.focus();
			}
			return;
		}

		// Navigate with arrow keys
		if (focusableElements && ['ArrowDown', 'ArrowUp'].includes(e.key)) {
			e.preventDefault();
			const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
			let nextIndex = currentIndex;

			if (e.key === 'ArrowDown') {
				nextIndex = currentIndex + 1 >= focusableElements.length ? 0 : currentIndex + 1;
			} else {
				nextIndex = currentIndex - 1 < 0 ? focusableElements.length - 1 : currentIndex - 1;
			}

			focusableElements[nextIndex]?.focus();
		}

		trapFocus(e);
	};

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

	// Manage focus and animations
	$effect(() => {
		if (isOpen && browser) {
			// Store last focused element
			lastFocusedElement = document.activeElement as HTMLElement;

			// Start animation
			isAnimating = true;

			// Calculate position
			calculatePosition();

			// Setup focus management
			tick().then(() => {
				if (dropdownElement) {
					const elements = dropdownElement.querySelectorAll(
						'button:not([disabled]), input:not([disabled]), [tabindex="0"]'
					);
					focusableElements = Array.from(elements) as HTMLElement[];

					// Focus first focusable element
					if (autoFocus && focusableElements.length > 0) {
						focusableElements[0].focus();
					}
				}
			});
		} else if (!isOpen && lastFocusedElement) {
			// Return focus when closing
			lastFocusedElement.focus();
			lastFocusedElement = null;
		}
	});

	// Recalculate position on scroll/resize
	$effect(() => {
		if (isOpen && browser) {
			const handlePositionUpdate = () => calculatePosition();
			window.addEventListener('scroll', handlePositionUpdate, true);
			window.addEventListener('resize', handlePositionUpdate);

			return () => {
				window.removeEventListener('scroll', handlePositionUpdate, true);
				window.removeEventListener('resize', handlePositionUpdate);
			};
		}
	});
</script>

<svelte:window on:click={handleOutsideClick} on:keydown={handleKeydown} />

{#if isOpen && browser}
	<div
		bind:this={dropdownElement}
		id={dropdownId}
		{role}
		aria-labelledby={triggerId}
		class="dropdown absolute mt-2 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]"
		class:dropdown-enter={isAnimating}
		style="
			top: {position.top}; 
			left: {position.left}; 
			right: {position.right};
			width: {width}; 
			max-height: {maxHeight}; 
			z-index: {zIndex};
			backdrop-filter: blur(16px) saturate(180%);
			-webkit-backdrop-filter: blur(16px) saturate(180%);
			background-color: rgba(17, 17, 17, 0.8);
		"
	>
		{@render children()}
	</div>
{/if}

<style>
	.dropdown {
		transform-origin: top center;
		transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
		will-change: transform, opacity;
	}

	.dropdown-enter {
		animation: dropdownEnter 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	@keyframes dropdownEnter {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(-8px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	/* Ensure proper stacking context */
	.dropdown {
		isolation: isolate;
	}
</style>
