import { writable } from 'svelte/store';
import type { ProjectItem, ArticleItem, FilterState } from '$lib/types/content';

export const createFilterStore = () => {
	const initialState: FilterState = {
		query: '',
		selectedTags: [],
		dateRange: {},
		sortBy: 'date',
		sortOrder: 'desc'
	};

	const { subscribe, set, update } = writable(initialState);

	return {
		subscribe,
		set,
		update,
		setQuery: (query: string) => update((state) => ({ ...state, query })),
		setSelectedTags: (tags: string[]) => update((state) => ({ ...state, selectedTags: tags })),
		setDateRange: (dateRange: { from?: string; to?: string }) =>
			update((state) => ({ ...state, dateRange })),
		setSortBy: (sortBy: FilterState['sortBy']) => update((state) => ({ ...state, sortBy })),
		setSortOrder: (sortOrder: FilterState['sortOrder']) =>
			update((state) => ({ ...state, sortOrder })),
		addTag: (tag: string) =>
			update((state) => ({
				...state,
				selectedTags: [...state.selectedTags, tag]
			})),
		removeTag: (tag: string) =>
			update((state) => ({
				...state,
				selectedTags: state.selectedTags.filter((t) => t !== tag)
			})),
		clearFilters: () => set(initialState),
		reset: () => set(initialState)
	};
};

// Create stores for projects and articles
export const projectsFilterStore = createFilterStore();
export const articlesFilterStore = createFilterStore();

// Helper function to create filtered items derived store
export const createFilteredItems = <T extends ProjectItem | ArticleItem>(
	items: T[],
	filters: FilterState,
	selectedLanguage: string,
	filterFn: (item: T, filters: FilterState, language: string) => boolean
) => {
	return items.filter((item) => filterFn(item, filters, selectedLanguage));
};
