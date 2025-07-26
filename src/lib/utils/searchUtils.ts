import type { ProjectItem, ArticleItem, FilterState } from '$lib/types/content';

// Text search utility
export const matchesQuery = (text: string, query: string): boolean => {
	if (!query.trim()) return true;
	return text.toLowerCase().includes(query.toLowerCase());
};

// Extract all unique tags from items
export const extractTags = (items: (ProjectItem | ArticleItem)[], language: string): string[] => {
	const tagSet = new Set<string>();

	items.forEach((item) => {
		const translation = item.translations[language];
		if (translation?.tags) {
			translation.tags.forEach((tag) => tagSet.add(tag));
		}
	});

	return Array.from(tagSet).sort();
};

// Extract all unique statuses from projects
export const extractStatuses = (projects: ProjectItem[]): string[] => {
	const statusSet = new Set<string>();

	projects.forEach((project) => {
		if (project.meta.status) {
			statusSet.add(project.meta.status);
		}
	});

	return Array.from(statusSet).sort();
};

// Date filtering utility
export const isInDateRange = (
	date: string | undefined,
	dateRange: { from?: string; to?: string }
): boolean => {
	if (!date) return true;
	if (!dateRange.from && !dateRange.to) return true;

	const itemDate = new Date(date);
	const fromDate = dateRange.from ? new Date(dateRange.from) : null;
	const toDate = dateRange.to ? new Date(dateRange.to) : null;

	if (fromDate && itemDate < fromDate) return false;
	if (toDate && itemDate > toDate) return false;

	return true;
};

// Project filtering function
export const filterProjects = (
	projects: ProjectItem[],
	filters: FilterState,
	language: string
): ProjectItem[] => {
	return projects.filter((project) => {
		const translation = project.translations[language];
		if (!translation) return false;

		// Text search in title and description
		const searchText = `${translation.title} ${translation.description || ''}`;
		if (!matchesQuery(searchText, filters.query)) return false;

		// Tag filtering
		if (filters.selectedTags.length > 0) {
			const projectTags = translation.tags || [];
			const hasSelectedTag = filters.selectedTags.some((tag) => projectTags.includes(tag));
			if (!hasSelectedTag) return false;
		}

		// Status filtering
		if (filters.selectedStatuses.length > 0) {
			if (!filters.selectedStatuses.includes(project.meta.status)) return false;
		}

		// Date filtering (using created_date for projects)
		if (!isInDateRange(project.meta.created_date, filters.dateRange)) return false;

		return true;
	});
};

// Article filtering function
export const filterArticles = (
	articles: ArticleItem[],
	filters: FilterState,
	language: string
): ArticleItem[] => {
	return articles.filter((article) => {
		const translation = article.translations[language];
		if (!translation) return false;

		// Text search in title and excerpt
		const searchText = `${translation.title} ${translation.excerpt || ''}`;
		if (!matchesQuery(searchText, filters.query)) return false;

		// Tag filtering
		if (filters.selectedTags.length > 0) {
			const articleTags = translation.tags || [];
			const hasSelectedTag = filters.selectedTags.some((tag) => articleTags.includes(tag));
			if (!hasSelectedTag) return false;
		}

		// Date filtering (using published_date for articles)
		if (!isInDateRange(article.meta.published_date, filters.dateRange)) return false;

		return true;
	});
};

// Sorting function
export const sortItems = (
	items: (ProjectItem | ArticleItem)[],
	sortBy: FilterState['sortBy'],
	sortOrder: FilterState['sortOrder'],
	language: string
): (ProjectItem | ArticleItem)[] => {
	const sorted = [...items].sort((a, b) => {
		let comparison = 0;

		switch (sortBy) {
			case 'title': {
				const titleA = a.translations[language]?.title || '';
				const titleB = b.translations[language]?.title || '';
				comparison = titleA.localeCompare(titleB);
				break;
			}
			case 'date': {
				const dateA = (a.meta as ArticleItem['meta']).published_date || a.meta.created_date || '';
				const dateB = (b.meta as ArticleItem['meta']).published_date || b.meta.created_date || '';
				comparison = new Date(dateA).getTime() - new Date(dateB).getTime();
				break;
			}
			case 'relevance': {
				// For relevance, we could implement a scoring system
				// For now, fallback to date sorting
				const relDateA =
					(a.meta as ArticleItem['meta']).published_date || a.meta.created_date || '';
				const relDateB =
					(b.meta as ArticleItem['meta']).published_date || b.meta.created_date || '';
				comparison = new Date(relDateA).getTime() - new Date(relDateB).getTime();
				break;
			}
		}

		return sortOrder === 'asc' ? comparison : -comparison;
	});

	return sorted;
};

// Main filtering and sorting function
export const applyFilters = (
	items: (ProjectItem | ArticleItem)[],
	filters: FilterState,
	language: string,
	type: 'projects' | 'articles'
): (ProjectItem | ArticleItem)[] => {
	const filtered =
		type === 'projects'
			? filterProjects(items as ProjectItem[], filters, language)
			: filterArticles(items as ArticleItem[], filters, language);

	return sortItems(filtered, filters.sortBy, filters.sortOrder, language);
};
