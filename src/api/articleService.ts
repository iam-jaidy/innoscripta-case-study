import { SOURCES, type SourceName } from '@/lib/constants';
import { GuardianAPI } from './sources/guardian';
import { NewsAPIAdapter } from './sources/newsapi';
import { NYTimesAPI } from './sources/nyt';
import type { Article, NewsSource, SearchParams } from './types';

const apiSourcesMap: Record<SourceName, NewsSource> = {
  [SOURCES.THE_GUARDIAN]: new GuardianAPI(),
  [SOURCES.NY_TIMES]: new NYTimesAPI(),
  [SOURCES.NEWS_API]: new NewsAPIAdapter(),
};

export const fetchAllNews = async (
  filters: SearchParams,
  enabledSources: string[],
  page: number = 0
): Promise<Article[]> => {
  const activeSources = Object.entries(apiSourcesMap)
    .filter(([sourceName]) => enabledSources.includes(sourceName))
    .map(([, source]) => source);

  if (activeSources.length === 0) return [];

  const results = await Promise.allSettled(
    activeSources.map((source) => source.fetchArticles({ ...filters, page }))
  );

  const allArticles = results
    .filter((result): result is PromiseFulfilledResult<Article[]> => result.status === 'fulfilled')
    .flatMap((result) => result.value)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return allArticles;
};
