import { useAppStore } from '@/store/useAppStore';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useNewsQuery } from './useNewsQuery';

const useNewsFeedLogic = () => {
  const { filters, preferences } = useAppStore();

  const enabledSources = filters.source ? [filters.source] : preferences.sources;

  const preferredCategories = filters.category ? [filters.category] : preferences.categories;

  const queryParams = {
    ...filters,
    categories: preferredCategories,
  };

  const { data, isLoading, isError, error, fetchNextPage, hasNextPage } = useNewsQuery(
    queryParams,
    enabledSources
  );

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const articles = data?.pages.flatMap((page) => page) || [];
  const isEmpty = !isLoading && articles.length === 0;
  return {
    articles,
    state: {
      isLoading,
      isError,
      isEmpty,
    },
    error,
    pagination: {
      hasNextPage,
      loadMoreRef: ref,
    },
  };
};

export default useNewsFeedLogic;
