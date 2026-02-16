import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

type Filters = {
  source?: string;
  category?: string;
  keyword?: string;
  dateRange?: { from: Date; to?: Date };
};

type Preferences = {
  sources: string[];
  categories: string[];
};

type Store = {
  filters: Filters;
  preferences: Preferences;
};

const store: Store = {
  filters: {},
  preferences: { sources: [], categories: [] },
};

vi.mock('@/store/useAppStore', () => ({
  useAppStore: (): Store => store,
}));

type InViewResult = {
  ref: (node?: Element | null) => void;
  inView: boolean;
};

let inViewValue = false;
const inViewRefSpy = vi.fn<(node?: Element | null) => void>();

vi.mock('react-intersection-observer', () => ({
  useInView: (): InViewResult => ({
    ref: inViewRefSpy,
    inView: inViewValue,
  }),
}));

type NewsQueryResult = {
  data?: { pages: Array<Array<unknown>> };
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  fetchNextPage: () => Promise<unknown> | void;
  hasNextPage: boolean;
};

const fetchNextPageSpy = vi.fn<() => Promise<void>>(() => Promise.resolve());

let newsQueryReturn: NewsQueryResult = {
  data: { pages: [] },
  isLoading: false,
  isError: false,
  error: undefined,
  fetchNextPage: fetchNextPageSpy,
  hasNextPage: false,
};

const useNewsQuerySpy = vi.fn<
  (queryParams: Record<string, unknown>, enabledSources: string[]) => NewsQueryResult
>(() => newsQueryReturn);

vi.mock('@/hooks/useNewsQuery', () => ({
  useNewsQuery: (queryParams: Record<string, unknown>, enabledSources: string[]) =>
    useNewsQuerySpy(queryParams, enabledSources),
}));

import useNewsFeedLogic from '@/hooks/useNewsFeedLogic';

describe('useNewsFeedLogic', () => {
  beforeEach(() => {
    store.filters = {};
    store.preferences = { sources: [], categories: [] };

    inViewValue = false;
    inViewRefSpy.mockReset();

    fetchNextPageSpy.mockReset();

    newsQueryReturn = {
      data: { pages: [] },
      isLoading: false,
      isError: false,
      error: undefined,
      fetchNextPage: fetchNextPageSpy,
      hasNextPage: false,
    };

    useNewsQuerySpy.mockClear();
  });

  it('uses preferences.sources when filters.source is not set', () => {
    store.filters = { keyword: 'hi' };
    store.preferences = { sources: ['The Guardian', 'NY Times'], categories: ['tech'] };

    renderHook(() => useNewsFeedLogic());

    expect(useNewsQuerySpy).toHaveBeenCalledTimes(1);

    const call = useNewsQuerySpy.mock.calls[0];
    const queryParams = call[0];
    const enabledSources = call[1];

    expect(enabledSources).toEqual(['The Guardian', 'NY Times']);
    expect(queryParams).toMatchObject({
      keyword: 'hi',
      categories: ['tech'],
    });
  });

  it('uses filters.source when set (single source)', () => {
    store.filters = { source: 'NY Times' };
    store.preferences = { sources: ['The Guardian'], categories: ['business'] };

    renderHook(() => useNewsFeedLogic());

    const call = useNewsQuerySpy.mock.calls[0];
    const enabledSources = call[1];

    expect(enabledSources).toEqual(['NY Times']);
  });

  it('uses preferences.categories when filters.category is not set', () => {
    store.filters = { keyword: 'bitcoin' };
    store.preferences = { sources: ['The Guardian'], categories: ['business', 'tech'] };

    renderHook(() => useNewsFeedLogic());

    const call = useNewsQuerySpy.mock.calls[0];
    const queryParams = call[0];

    expect(queryParams).toMatchObject({
      keyword: 'bitcoin',
      categories: ['business', 'tech'],
    });
  });

  it('uses filters.category when set (single category)', () => {
    store.filters = { category: 'sports' };
    store.preferences = { sources: ['The Guardian'], categories: ['business', 'tech'] };

    renderHook(() => useNewsFeedLogic());

    const call = useNewsQuerySpy.mock.calls[0];
    const queryParams = call[0];

    expect(queryParams).toMatchObject({
      category: 'sports',
      categories: ['sports'],
    });
  });

  it('flattens pages into articles and sets isEmpty correctly', () => {
    store.filters = {};
    store.preferences = { sources: ['The Guardian'], categories: ['tech'] };

    const a = { id: 'a' };
    const b = { id: 'b' };

    newsQueryReturn = {
      ...newsQueryReturn,
      data: { pages: [[a], [b]] },
      isLoading: false,
    };

    const { result } = renderHook(() => useNewsFeedLogic());

    expect(result.current.articles).toEqual([a, b]);
    expect(result.current.state.isEmpty).toBe(false);

    newsQueryReturn = {
      ...newsQueryReturn,
      data: { pages: [] },
      isLoading: false,
    };

    const { result: result2 } = renderHook(() => useNewsFeedLogic());
    expect(result2.current.articles).toEqual([]);
    expect(result2.current.state.isEmpty).toBe(true);
  });

  it('calls fetchNextPage when inView and hasNextPage are true', async () => {
    store.filters = {};
    store.preferences = { sources: ['The Guardian'], categories: ['tech'] };

    inViewValue = true;

    newsQueryReturn = {
      ...newsQueryReturn,
      hasNextPage: true,
      fetchNextPage: fetchNextPageSpy,
    };

    renderHook(() => useNewsFeedLogic());

    await waitFor(() => {
      expect(fetchNextPageSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call fetchNextPage when inView is false', async () => {
    store.filters = {};
    store.preferences = { sources: ['The Guardian'], categories: ['tech'] };

    inViewValue = false;

    newsQueryReturn = {
      ...newsQueryReturn,
      hasNextPage: true,
      fetchNextPage: fetchNextPageSpy,
    };

    renderHook(() => useNewsFeedLogic());

    await Promise.resolve();

    expect(fetchNextPageSpy).not.toHaveBeenCalled();
  });

  it('returns loadMoreRef from useInView', () => {
    store.filters = {};
    store.preferences = { sources: ['The Guardian'], categories: ['tech'] };

    const { result } = renderHook(() => useNewsFeedLogic());

    expect(result.current.pagination.loadMoreRef).toBe(inViewRefSpy);
  });
});
