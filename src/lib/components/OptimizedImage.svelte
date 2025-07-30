<script lang="ts">
	let {
		src = null,
		alt = '',
		cssClass = '',
		loading = 'lazy',
		showPlaceholder = false,
		sizes = '100vw',
		...restProps
	}: {
		src?: string | null;
		alt?: string;
		cssClass?: string;
		loading?: 'lazy' | 'eager';
		showPlaceholder?: boolean;
		sizes?: string;
		[key: string]: unknown;
	} = $props();

	const placeholderIcon = '/placeholder.svg';

	// Pre-load all images using import.meta.glob for vite-imagetools
	const articleImages = import.meta.glob('../assets/images/articles/**/*.{jpg,jpeg,png,webp}', {
		query: '&imagetools',
		eager: false
	});

	const projectImages = import.meta.glob('../assets/images/projects/**/*.{jpg,jpeg,png,webp}', {
		query: '&imagetools',
		eager: false
	});

	let optimizedImage: {
		sources?: { avif: string; webp: string; jpeg: string };
		img: { src: string };
	} | null = $state(null);
	let isLoading = $state(true);
	// Remove unused hasError variable

	$effect(() => {
		const loadImage = async () => {
			if (!src || showPlaceholder) {
				isLoading = false;
				return;
			}

			try {
				// Parse the image path to extract components
				if (src.startsWith('/images/') || src.startsWith('images/')) {
					const cleanPath = src.startsWith('/') ? src.substring(1) : src;

					// Look for the image in our pre-loaded glob imports
					const fullPath = `../assets/${cleanPath}`;
					let imageLoader: (() => Promise<unknown>) | null = null;

					// Check article images first
					if (cleanPath.includes('articles/')) {
						imageLoader = articleImages[fullPath];
					}
					// Then check project images
					else if (cleanPath.includes('projects/')) {
						imageLoader = projectImages[fullPath];
					}

					if (imageLoader) {
						const imageModule = (await imageLoader()) as { default?: string };

						// vite-imagetools returns a srcset string in imageModule.default
						if (imageModule.default && typeof imageModule.default === 'string') {
							const srcsetString = imageModule.default;

							// Parse the srcset to extract different formats and sizes
							const srcsets = srcsetString.split(', ');
							const avifSrcs: string[] = [];
							const webpSrcs: string[] = [];
							const jpegSrcs: string[] = [];
							let fallbackSrc = '';

							srcsets.forEach((srcset: string) => {
								const [url] = srcset.split(' ');
								if (url.includes('.avif')) {
									avifSrcs.push(srcset);
								} else if (url.includes('.webp')) {
									webpSrcs.push(srcset);
								} else if (url.includes('.jpeg') || url.includes('.jpg')) {
									jpegSrcs.push(srcset);
									if (!fallbackSrc) fallbackSrc = url; // Use first jpeg as fallback
								}
							});

							// Create the expected structure for our component
							optimizedImage = {
								sources: {
									avif: avifSrcs.join(', '),
									webp: webpSrcs.join(', '),
									jpeg: jpegSrcs.join(', ')
								},
								img: {
									src: fallbackSrc
								}
							};
						} else {
							// Fallback to original path if unexpected structure
							optimizedImage = { img: { src: `/${cleanPath}` } };
						}
					} else {
						// Fallback to original path if not found in glob
						optimizedImage = { img: { src: `/${cleanPath}` } };
					}
				} else {
					// For non-images/ paths, use as-is
					optimizedImage = { img: { src } };
				}
			} catch (error) {
				console.warn('Failed to load optimized image:', error);
				// Fallback to original src
				optimizedImage = { img: { src: src.startsWith('/') ? src : `/${src}` } };
			} finally {
				isLoading = false;
			}
		};

		loadImage();
	});
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
	{:else if isLoading}
		<div class="flex h-full w-full items-center justify-center bg-white/10 backdrop-blur-md">
			<div
				class="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/60"
			></div>
		</div>
	{:else if optimizedImage && optimizedImage.sources}
		<!-- vite-imagetools generated picture element with AVIF, WebP, and JPEG -->
		<picture>
			{#if optimizedImage.sources.avif}
				<source srcset={optimizedImage.sources.avif} type="image/avif" {sizes} />
			{/if}
			{#if optimizedImage.sources.webp}
				<source srcset={optimizedImage.sources.webp} type="image/webp" {sizes} />
			{/if}
			{#if optimizedImage.sources.jpeg}
				<source srcset={optimizedImage.sources.jpeg} type="image/jpeg" {sizes} />
			{/if}
			<img
				src={optimizedImage.img.src}
				{alt}
				class="h-full w-full object-cover"
				{loading}
				{...restProps}
			/>
		</picture>
	{:else if optimizedImage?.img?.src}
		<!-- Fallback single image -->
		<img
			src={optimizedImage.img.src}
			{alt}
			class="h-full w-full object-cover"
			{loading}
			{...restProps}
		/>
	{:else}
		<div class="flex h-full w-full items-center justify-center bg-white/10 backdrop-blur-md">
			<img
				src={placeholderIcon}
				alt=""
				class="h-12 w-12 opacity-60"
				style="filter: brightness(0) saturate(100%) invert(100%);"
			/>
		</div>
	{/if}
</div>
