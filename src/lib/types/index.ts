// Re-export all types from content
export * from './content';

// Scroll configuration types
export interface ScrollConfig {
	offsets: Record<string, number>;
	defaultOffset: number;
}
