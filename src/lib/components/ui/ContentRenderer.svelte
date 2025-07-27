<script lang="ts">
	import type { ContentBlocks, ContentBlock } from '$lib/types/content.ts';

	export let content: ContentBlocks;
	export let className: string = '';
	export let blockClasses: {
		paragraph?: string;
		header?: { h1?: string; h2?: string; h3?: string; h4?: string; h5?: string; h6?: string };
		list?: string;
		listItem?: string;
		quote?: string;
		code?: string;
		image?: string;
		divider?: string;
	} = {};

	// Default classes
	const defaultClasses = {
		paragraph: 'mb-6 text-xl leading-relaxed',
		header: {
			h1: 'mt-10 mb-6 text-4xl font-normal sm:text-5xl 2xl:text-6xl',
			h2: 'mt-8 mb-5 text-3xl font-normal sm:text-4xl 2xl:text-5xl',
			h3: 'mt-6 mb-4 text-2xl font-normal sm:text-3xl 2xl:text-4xl',
			h4: 'mt-5 mb-3 text-xl font-normal sm:text-2xl 2xl:text-3xl',
			h5: 'mt-4 mb-3 text-lg font-medium sm:text-xl 2xl:text-2xl',
			h6: 'mt-3 mb-2 text-base font-medium sm:text-lg 2xl:text-xl'
		},
		list: 'mb-6 ml-6 list-disc space-y-3',
		listItem: 'text-xl leading-relaxed',
		quote: 'mb-6 border-l-4 border-gray-600 pl-6 text-gray-300 italic',
		code: 'overflow-x-auto rounded-xl bg-gray-800/50 p-6 text-sm',
		image: 'mx-auto max-w-full rounded-2xl',
		divider: 'my-10 border-gray-700'
	};

	// Merge custom classes with defaults
	const classes = {
		paragraph: blockClasses.paragraph || defaultClasses.paragraph,
		header: {
			h1: blockClasses.header?.h1 || defaultClasses.header.h1,
			h2: blockClasses.header?.h2 || defaultClasses.header.h2,
			h3: blockClasses.header?.h3 || defaultClasses.header.h3,
			h4: blockClasses.header?.h4 || defaultClasses.header.h4,
			h5: blockClasses.header?.h5 || defaultClasses.header.h5,
			h6: blockClasses.header?.h6 || defaultClasses.header.h6
		},
		list: blockClasses.list || defaultClasses.list,
		listItem: blockClasses.listItem || defaultClasses.listItem,
		quote: blockClasses.quote || defaultClasses.quote,
		code: blockClasses.code || defaultClasses.code,
		image: blockClasses.image || defaultClasses.image,
		divider: blockClasses.divider || defaultClasses.divider
	};

	// Raggruppa i blocchi per gestire layout con immagini float
	function groupBlocksForLayout(blocks: ContentBlock[]) {
		const groups: Array<
			| {
					type: 'float-layout';
					image: ContentBlock;
					content: ContentBlock[];
					layout: string;
			  }
			| {
					type: 'normal';
					block: ContentBlock;
			  }
		> = [];
		let i = 0;

		while (i < blocks.length) {
			const block = blocks[i];

			// Cerca se il prossimo blocco è un'immagine float
			const nextBlock = i + 1 < blocks.length ? blocks[i + 1] : null;
			const isNextImageFloat =
				nextBlock &&
				nextBlock.type === 'image' &&
				(nextBlock.data.layout === 'left' || nextBlock.data.layout === 'right');

			if (isNextImageFloat && (block.type === 'paragraph' || block.type === 'list')) {
				// Crea un gruppo con il contenuto corrente + l'immagine float successiva
				groups.push({
					type: 'float-layout',
					image: nextBlock,
					content: [block], // Il paragrafo che precede l'immagine
					layout: nextBlock.data.layout
				});
				i += 2; // Salta sia il blocco corrente che l'immagine
			} else if (
				block.type === 'image' &&
				(block.data.layout === 'left' || block.data.layout === 'right')
			) {
				// Immagine float senza contenuto precedente compatibile
				groups.push({
					type: 'float-layout',
					image: block,
					content: [], // Nessun contenuto da affiancare
					layout: block.data.layout
				});
				i++;
			} else {
				// Blocco normale
				groups.push({ type: 'normal', block });
				i++;
			}
		}

		return groups;
	}

	// Calcola dimensioni immagine
	function getImageDimensions(imageBlock: ContentBlock) {
		let width = '300px'; // default
		let height = 'auto';

		if (imageBlock.data.width) {
			width = imageBlock.data.width;
		} else if (imageBlock.data.size) {
			switch (imageBlock.data.size) {
				case 'small':
					width = '200px';
					break;
				case 'large':
					width = '400px';
					break;
				default:
					width = '300px';
					break;
			}
		}

		if (imageBlock.data.height) {
			height = imageBlock.data.height;
		}

		return { width, height };
	}

	$: groupedBlocks = groupBlocksForLayout(content.blocks);
</script>

<div class={className}>
	{#each groupedBlocks as group (group.type === 'normal' ? group.block.id || group.block.type : `float-${group.image?.id || 'default'}`)}
		{#if group.type === 'float-layout'}
			{@const dimensions = getImageDimensions(group.image)}
			<!-- Layout con immagine float e testo che scorre attorno -->
			<div class="mb-8" style="display: flow-root;">
				<!-- Immagine float -->
				<div
					class="mb-4 {group.layout === 'left' ? 'float-left mr-6' : 'float-right ml-6'}"
					style="width: {dimensions.width}; height: {dimensions.height};"
				>
					{#if group.image.data.src === '/placeholder.svg'}
						<div
							class="relative flex h-full min-h-[200px] w-full items-center justify-center overflow-hidden rounded-xl bg-white/10 backdrop-blur-md"
						>
							<img
								src={group.image.data.src}
								alt={group.image.data.alt || ''}
								class="h-12 w-12 opacity-60"
								style="filter: brightness(0) saturate(100%) invert(100%);"
							/>
						</div>
					{:else}
						<img
							src={group.image.data.src}
							alt={group.image.data.alt || ''}
							class="h-full w-full rounded-xl object-cover"
							loading="lazy"
						/>
					{/if}

					<!-- Didascalia sotto l'immagine -->
					{#if group.image.data.alt}
						<p class="mt-2 text-center text-xs leading-tight text-gray-600 dark:text-gray-400">
							{group.image.data.alt}
						</p>
					{/if}
				</div>

				<!-- Contenuto che scorre attorno -->
				<div class="text-content">
					{#each group.content as block (block.id || block.type)}
						{#if block.type === 'paragraph'}
							<p class="mb-6 text-xl leading-relaxed">
								{@html block.data.text || ''}
							</p>
						{:else if block.type === 'list'}
							<ul class="mb-6 ml-6 list-disc space-y-3">
								{#each block.data.items || [] as item (item)}
									<li class="text-xl leading-relaxed">{@html item}</li>
								{/each}
							</ul>
						{/if}
					{/each}
				</div>

				<!-- Clear floats -->
				<div class="clear-both"></div>
			</div>
		{:else}
			<!-- Blocco normale -->
			{@const block = group.block}
			{#if block.type === 'paragraph'}
				<p class={classes.paragraph}>
					{@html block.data.text || ''}
				</p>
			{:else if block.type === 'header'}
				{#if block.data.level === 1}
					<h1 class={classes.header.h1}>
						{block.data.text || ''}
					</h1>
				{:else if block.data.level === 2}
					<h2 class={classes.header.h2}>
						{block.data.text || ''}
					</h2>
				{:else if block.data.level === 3}
					<h3 class={classes.header.h3}>
						{block.data.text || ''}
					</h3>
				{:else if block.data.level === 4}
					<h4 class={classes.header.h4}>
						{block.data.text || ''}
					</h4>
				{:else if block.data.level === 5}
					<h5 class={classes.header.h5}>
						{block.data.text || ''}
					</h5>
				{:else if block.data.level === 6}
					<h6 class={classes.header.h6}>
						{block.data.text || ''}
					</h6>
				{:else}
					<h2 class={classes.header.h2}>
						{block.data.text || ''}
					</h2>
				{/if}
			{:else if block.type === 'list'}
				<ul class={classes.list}>
					{#each block.data.items || [] as item (item)}
						<li class={classes.listItem}>{@html item}</li>
					{/each}
				</ul>
			{:else if block.type === 'quote'}
				<blockquote class={classes.quote}>
					<p>
						{@html block.data.text || ''}
					</p>
				</blockquote>
			{:else if block.type === 'code'}
				<div class="mb-4">
					{#if block.data.language}
						<div class="mb-1 text-sm text-gray-500 dark:text-gray-400">
							{block.data.language}
						</div>
					{/if}
					<pre class={classes.code}><code class="text-sm">{block.data.text || ''}</code></pre>
				</div>
			{:else if block.type === 'image'}
				<!-- Immagine full width -->
				<div class="mb-8">
					{#if block.data.src === '/placeholder.svg'}
						<div class="relative mx-auto aspect-video max-w-full overflow-hidden rounded-2xl">
							<div
								class="flex h-full w-full items-center justify-center bg-white/10 backdrop-blur-md"
							>
								<img
									src={block.data.src}
									alt={block.data.alt || ''}
									class="h-12 w-12 opacity-60"
									style="filter: brightness(0) saturate(100%) invert(100%);"
								/>
							</div>
						</div>
					{:else}
						<img
							src={block.data.src || ''}
							alt={block.data.alt || ''}
							class={classes.image}
							loading="lazy"
						/>
					{/if}
					{#if block.data.alt}
						<p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
							{block.data.alt}
						</p>
					{/if}
				</div>
			{:else if block.type === 'divider'}
				<hr class={classes.divider} />
			{:else}
				<!-- Fallback per tipi non riconosciuti -->
				<p class={classes.paragraph}>
					{@html block.data.text || ''}
				</p>
			{/if}
		{/if}
	{/each}
</div>
