import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SearchParams } from '@/api/types';

type UseInfiniteQueryArg = {
  queryKey: unknown[];
  enabled?: boolean;
  queryFn: (ctx: { pageParam?: number }) => unknown;
  initialPageParam: number;
  getNextPageParam: (lastPage: unknown, allPages: unknown[]) => unknown;
  staleTime: number;
  retry: number;
};

const useInfiniteQuerySpy = vi.fn<(arg: UseInfiniteQueryArg) => unknown>(() => ({ ok: true }));

vi.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: (arg: UseInfiniteQueryArg) => useInfiniteQuerySpy(arg),
}));

const fetchAllNewsSpy = vi.fn<
  (filters: SearchParams, enabledSources: string[], page?: number) => Promise<unknown>
>(() => Promise.resolve([]));

vi.mock('@/api/articleService', () => ({
  fetchAllNews: (filters: SearchParams, enabledSources: string[], page?: number) =>
    fetchAllNewsSpy(filters, enabledSources, page),
}));

import { useNewsQuery } from '@/hooks/useNewsQuery';

describe('useNewsQuery enabled', () => {
  beforeEach(() => {
    useInfiniteQuerySpy.mockClear();
    fetchAllNewsSpy.mockClear();
  });

  it('sets enabled=false when enabledSources is empty', () => {
    const filters: SearchParams = {};
    useNewsQuery(filters, []);

    const arg = useInfiniteQuerySpy.mock.calls[0][0];
    expect(arg.enabled).toBe(false);
  });

  it('sets enabled=true when enabledSources has at least one value', () => {
    const filters: SearchParams = {};
    useNewsQuery(filters, ['The Guardian']);

    const arg = useInfiniteQuerySpy.mock.calls[0][0];
    expect(arg.enabled).toBe(true);
  });
});
