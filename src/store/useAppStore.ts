import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SearchParams } from '@/api/types';
import { SOURCES, type Category, type SourceName } from '@/lib/constants';

type AppState = {
  filters: SearchParams;
  setFilters: (filters: Partial<SearchParams>) => void;
  preferences: {
    sources: SourceName[];
    categories: Category[];
  };
  setPreferences: (newPreferences: { sources: SourceName[]; categories: Category[] }) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      filters: {
        keyword: '',
        category: undefined,
        dateRange: undefined,
        source: undefined,
      },
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),
      preferences: {
        sources: Object.values(SOURCES),
        categories: [],
      },
      setPreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),
    }),
    {
      name: 'news-feed-storage',
      partialize: (state) => ({ preferences: state.preferences }),
    }
  )
);
