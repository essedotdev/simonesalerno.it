// Re-export utilities for convenient access
export { initializeAnalytics, isAnalyticsReady, trackPageView } from './analytics';
export { ContentLoader } from './content';
export { calculateOffset, handleAnchorClick, scrollToTop } from './scrollUtils';
export {
	applyFilters,
	extractStatuses,
	extractTags,
	filterArticles,
	filterProjects,
	isInDateRange,
	matchesQuery,
	sortItems
} from './searchUtils';
export { createTranslationMap, getTranslation, getTranslations } from './translations';
export { initViewportHeight, setViewportHeight } from './viewport';
