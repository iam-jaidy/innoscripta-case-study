import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchAllNews } from '@/api/articleService';
import type { SearchParams } from '@/api/types';

export const useNewsQuery = (filters: SearchParams, enabledSources: string[]) => {
  return useInfiniteQuery({
    queryKey: ['news', filters, enabledSources],
    enabled: enabledSources.length > 0,
    queryFn: ({ pageParam = 0 }) => fetchAllNews(filters, enabledSources, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      return allPages.length;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};
