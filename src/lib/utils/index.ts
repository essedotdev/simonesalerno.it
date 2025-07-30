// Re-export utilities for convenient access
export { initializeAnalytics, isAnalyticsReady, trackPageView } from './analytics';
export { ContentLoader } from './content';
export { handleAnchorClick, calculateOffset, scrollToTop } from './scrollUtils';
export { getTranslation, getTranslations, createTranslationMap } from './translations';
export {
	matchesQuery,
	extractTags,
	extractStatuses,
	isInDateRange,
	filterProjects,
	filterArticles,
	sortItems,
	applyFilters
} from './searchUtils';
