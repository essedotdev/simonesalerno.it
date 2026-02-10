import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { basename, dirname, extname, join, relative } from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Configuration for image optimization
const OPTIMIZATION_CONFIG = {
	quality: 80, // JPEG quality (0-100)
	maxWidth: 720, // Maximum width for OG images
	maxHeight: 408, // Maximum height for OG images (OG standard)
	progressive: true, // Progressive JPEG loading
	mozjpeg: true // Use mozjpeg encoder for better compression
} as const;

// Paths
const assetsDir = join(rootDir, 'src/lib/assets/images');
const outputFile = join(rootDir, 'src/lib/assets/image-assets.ts');

interface ImageFile {
	path: string;
	relativePath: string;
	key: string;
}

/**
 * Recursively find all image files
 */
function findImageFiles(dir: string, baseDir: string = dir): ImageFile[] {
	const files: ImageFile[] = [];
	const items = readdirSync(dir);

	for (const item of items) {
		const fullPath = join(dir, item);
		const stat = statSync(fullPath);

		if (stat.isDirectory()) {
			files.push(...findImageFiles(fullPath, baseDir));
		} else if (stat.isFile()) {
			const ext = extname(item).toLowerCase();
			// Support more image formats since we're converting everything to JPEG anyway
			if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff'].includes(ext)) {
				// Use path.relative for cross-platform compatibility
				const relativePath = relative(baseDir, fullPath).replace(/\\/g, '/');
				files.push({
					path: fullPath,
					relativePath,
					key: generateKey(relativePath)
				});
			}
		}
	}

	return files;
}

/**
 * Generate a clean key from file path
 */
function generateKey(relativePath: string): string {
	// Convert path like "projects/doppia-os/featured.jpg" to "doppiaOsFeatured"
	// or "articles/il-mio-nuovo-laboratorio/featured.jpg" to "ilMioNuovoLaboratorioFeatured"

	const pathParts = relativePath.split('/');
	const filename = basename(
		pathParts[pathParts.length - 1],
		extname(pathParts[pathParts.length - 1])
	);

	let key = '';

	if (pathParts[0] === 'projects') {
		// For projects: combine project folder name + filename
		// e.g., "projects/doppia-os/featured.jpg" -> "doppiaOsFeatured"
		const projectSlug = pathParts[1];
		key = projectSlug + '-' + filename;
	} else if (pathParts[0] === 'articles') {
		// For articles: combine folder name + filename
		const articleSlug = pathParts[1];
		key = articleSlug + '-' + filename;
	}

	// Convert kebab-case to camelCase
	return key
		.split('-')
		.map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
		.join('');
}

/**
 * Optimize and convert image to base64 data URI
 * Converts all images to JPEG format for consistency and better compression
 */
async function optimizeImageToBase64(filePath: string): Promise<string> {
	try {
		// Optimize image with Sharp - convert everything to JPEG for consistency
		const optimizedBuffer = await sharp(filePath)
			.jpeg({
				quality: OPTIMIZATION_CONFIG.quality,
				progressive: OPTIMIZATION_CONFIG.progressive,
				mozjpeg: OPTIMIZATION_CONFIG.mozjpeg
			})
			.resize({
				width: OPTIMIZATION_CONFIG.maxWidth,
				height: OPTIMIZATION_CONFIG.maxHeight,
				fit: 'inside', // Maintain aspect ratio
				withoutEnlargement: true // Don't upscale smaller images
			})
			.toBuffer();

		const base64 = optimizedBuffer.toString('base64');
		return `data:image/jpeg;base64,${base64}`;
	} catch (error) {
		console.error(`Error optimizing ${filePath}:`, (error as Error).message);
		// Fallback to original method if Sharp fails
		return imageToBase64Fallback(filePath);
	}
}

/**
 * Fallback method for image conversion (original implementation)
 */
function imageToBase64Fallback(filePath: string): string {
	const buffer = readFileSync(filePath);
	const ext = extname(filePath).toLowerCase();

	let mimeType: string;
	switch (ext) {
		case '.jpg':
		case '.jpeg':
			mimeType = 'image/jpeg';
			break;
		case '.png':
			mimeType = 'image/png';
			break;
		case '.webp':
			mimeType = 'image/webp';
			break;
		default:
			throw new Error(`Unsupported image type: ${ext}`);
	}

	const base64 = buffer.toString('base64');
	return `data:${mimeType};base64,${base64}`;
}

/**
 * Main function
 */
async function main(): Promise<void> {
	console.log('🔍 Scanning for images...');
	if (!existsSync(assetsDir)) {
		console.log('📂 No images directory found, generating empty assets file.');
		writeFileSync(
			outputFile,
			`// Auto-generated image assets (empty - no images directory found)\nexport const imageAssets: Record<string, string> = {};\nexport function getImageAsset(key: string): string | null { return imageAssets[key] || null; }\nexport const availableImages: string[] = [];\nexport const imageStats = { totalImages: 0, totalSizeKB: 0, generatedAt: '${new Date().toISOString()}' };\n`
		);
		return;
	}
	const imageFiles = findImageFiles(assetsDir);

	console.log(`📷 Found ${imageFiles.length} images`);

	const assets: Record<string, string> = {};
	let totalSize = 0;

	for (const file of imageFiles) {
		console.log(`📝 Processing: ${file.relativePath} -> ${file.key}`);

		try {
			const dataUri = await optimizeImageToBase64(file.path);
			assets[file.key] = dataUri;

			// Calculate size for reporting
			const sizeKB = Math.round((dataUri.length * 0.75) / 1024); // rough base64 to bytes conversion
			totalSize += sizeKB;

			console.log(`   ✅ ${sizeKB}KB (optimized JPEG)`);
		} catch (error) {
			console.error(`   ❌ Error processing ${file.relativePath}:`, (error as Error).message);
		}
	}

	// Generate TypeScript file
	const tsContent = `// Auto-generated image assets for OG image generation
// This file is generated by scripts/generate-image-assets.ts
// Do not edit manually
//
// All images are optimized and converted to JPEG format for consistency
// Using Sharp with quality ${OPTIMIZATION_CONFIG.quality}%, max size ${OPTIMIZATION_CONFIG.maxWidth}x${OPTIMIZATION_CONFIG.maxHeight}px

export interface ImageAssets {
  [key: string]: string;
}

export const imageAssets: ImageAssets = {
${Object.entries(assets)
	.map(([key, dataUri]) => `  '${key}': '${dataUri}',`)
	.join('\n')}
};

// Helper function to get image by key
export function getImageAsset(key: string): string | null {
  return imageAssets[key] || null;
}

// Available image keys
export const availableImages = ${JSON.stringify(Object.keys(assets), null, 2)};

// Stats
export const imageStats = {
  totalImages: ${Object.keys(assets).length},
  totalSizeKB: ${totalSize},
  optimizationConfig: ${JSON.stringify(OPTIMIZATION_CONFIG, null, 2)},
  generatedAt: '${new Date().toISOString()}'
};
`;

	writeFileSync(outputFile, tsContent);

	console.log('');
	console.log('✨ Image assets generated successfully!');
	console.log(`📊 Total: ${Object.keys(assets).length} images, ~${totalSize}KB`);
	console.log(`📄 Output: ${outputFile}`);
	console.log('');
	console.log('Available keys:');
	Object.keys(assets).forEach((key) => console.log(`  - ${key}`));
}

main().catch((error) => {
	console.error('❌ Script failed:', error);
	process.exit(1);
});
