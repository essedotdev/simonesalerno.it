<script lang="ts">
	import type { GlobalContent } from '$lib/types';
	import { getTranslations, type TranslationKey } from '$lib/utils/translations';
	import Dropdown from './Dropdown.svelte';

	interface Props {
		dateRange: { from?: string; to?: string };
		onDateChange: (type: 'from' | 'to', value: string) => void;
		global?: GlobalContent;
	}

	let { dateRange, onDateChange, global }: Props = $props();

	const translationKeys: TranslationKey[] = ['dateRange', 'from', 'to', 'clearFilters', 'apply'];
	let t = $derived(getTranslations(global, translationKeys));

	let isOpen = $state(false);
	let triggerElement = $state<HTMLButtonElement>();

	const toggleDropdown = () => {
		if (!isOpen) {
			// Calculate position before opening
			if (triggerElement) {
				triggerElement.focus();
			}
		}
		isOpen = !isOpen;
	};

	const handleDateInput = (type: 'from' | 'to', event: Event) => {
		const target = event.target as HTMLInputElement;
		onDateChange(type, target.value);
	};

	const closeDropdown = () => {
		isOpen = false;
	};

	const hasDateRange = $derived(dateRange.from || dateRange.to);
	const formatDateRange = $derived(() => {
		if (dateRange.from && dateRange.to) {
			return `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`;
		} else if (dateRange.from) {
			return `${t.from} ${formatDate(dateRange.from)}`;
		} else if (dateRange.to) {
			return `${t.to} ${formatDate(dateRange.to)}`;
		}
		return '';
	});

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('it-IT', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	};
</script>

<div class="relative">
	<button
		bind:this={triggerElement}
		onclick={toggleDropdown}
		class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.02] px-4 py-2 text-white/80 transition-colors hover:bg-white/[.04]"
	>
		<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
			/>
		</svg>
		<span class="truncate">
			{hasDateRange ? formatDateRange : t.dateRange}
		</span>
		{#if hasDateRange}
			<span class="ml-1 rounded-full bg-white/10 px-2 py-1 text-xs"> • </span>
		{/if}
		<svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	<Dropdown {isOpen} {triggerElement} onClose={closeDropdown} width="24rem">
		<div class="space-y-4 p-4">
			<div class="space-y-2">
				<label for="date-from" class="block text-sm text-white/70">{t.from}</label>
				<input
					id="date-from"
					type="date"
					value={dateRange.from || ''}
					oninput={(e) => handleDateInput('from', e)}
					class="date-input w-full rounded-lg border border-white/10 bg-white/[.02] px-3 py-2 text-white focus:border-white/20 focus:outline-none"
				/>
			</div>
			<div class="space-y-2">
				<label for="date-to" class="block text-sm text-white/70">{t.to}</label>
				<input
					id="date-to"
					type="date"
					value={dateRange.to || ''}
					oninput={(e) => handleDateInput('to', e)}
					class="date-input w-full rounded-lg border border-white/10 bg-white/[.02] px-3 py-2 text-white focus:border-white/20 focus:outline-none"
				/>
			</div>
			<div class="flex gap-2 pt-2">
				<button
					onclick={() => {
						onDateChange('from', '');
						onDateChange('to', '');
					}}
					class="flex-1 rounded-lg border border-white/10 bg-white/[.02] px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/[.04]"
				>
					{t.clearFilters}
				</button>
				<button
					onclick={closeDropdown}
					class="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white transition-colors hover:bg-white/20"
				>
					{t.apply}
				</button>
			</div>
		</div>
	</Dropdown>
</div>

<style>
	.date-input::-webkit-calendar-picker-indicator {
		filter: invert(1) brightness(0.8);
		cursor: pointer;
	}

	.date-input::-webkit-inner-spin-button,
	.date-input::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
