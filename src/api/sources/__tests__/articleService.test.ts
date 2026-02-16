import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { fetchAllNews } from '../../articleService';
import { GuardianAPI } from '../guardian';
import { NYTimesAPI } from '../nyt';
import { NewsAPIAdapter } from '../newsapi';
import { SOURCES } from '@/lib/constants';
import type { Article } from '@/api/types';

describe('fetchAllNews', () => {
  let guardianSpy: MockInstance;
  let nytSpy: MockInstance;
  let newsApiSpy: MockInstance;

  beforeEach(() => {
    guardianSpy = vi.spyOn(GuardianAPI.prototype, 'fetchArticles');
    nytSpy = vi.spyOn(NYTimesAPI.prototype, 'fetchArticles');
    newsApiSpy = vi.spyOn(NewsAPIAdapter.prototype, 'fetchArticles');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createMockArticle = (source: string, title: string, date: string): Article => ({
    id: `${source}-${title}`,
    title,
    description: 'Test Description',
    author: 'Test Author',
    publishedAt: date,
    source,
    url: 'https://test.com',
    imageUrl: 'https://test.com/image.jpg',
  });

  it('fetches and aggregates news from all enabled sources', async () => {
    const article1 = createMockArticle('The Guardian', 'Old', '2023-01-01T10:00:00Z');
    const article2 = createMockArticle('New York Times', 'New', '2023-01-02T10:00:00Z');

    guardianSpy.mockResolvedValue([article1]);
    nytSpy.mockResolvedValue([article2]);
    newsApiSpy.mockResolvedValue([]);

    const results = await fetchAllNews({ keyword: 'test' }, [
      SOURCES.THE_GUARDIAN,
      SOURCES.NY_TIMES,
      SOURCES.NEWS_API,
    ]);

    expect(results).toHaveLength(2);
    expect(results[0].title).toBe('New');
    expect(results[1].title).toBe('Old');

    expect(guardianSpy).toHaveBeenCalled();
    expect(nytSpy).toHaveBeenCalled();
    expect(newsApiSpy).toHaveBeenCalled();
  });

  it('only calls fetchArticles for enabled sources', async () => {
    guardianSpy.mockResolvedValue([]);
    nytSpy.mockResolvedValue([]);
    newsApiSpy.mockResolvedValue([]);

    await fetchAllNews({ keyword: 'test' }, [SOURCES.THE_GUARDIAN]);

    expect(guardianSpy).toHaveBeenCalled();
    expect(nytSpy).not.toHaveBeenCalled();
    expect(newsApiSpy).not.toHaveBeenCalled();
  });

  it('returns empty array if no sources are enabled', async () => {
    const results = await fetchAllNews({ keyword: 'test' }, []);

    expect(results).toEqual([]);
    expect(guardianSpy).not.toHaveBeenCalled();
    expect(nytSpy).not.toHaveBeenCalled();
  });

  it('handles partial failures gracefully', async () => {
    const successArticle = createMockArticle('The Guardian', 'Success', '2023-01-01T10:00:00Z');

    guardianSpy.mockResolvedValue([successArticle]);
    nytSpy.mockRejectedValue(new Error('API Error'));

    const results = await fetchAllNews({ keyword: 'test' }, [
      SOURCES.THE_GUARDIAN,
      SOURCES.NY_TIMES,
    ]);

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Success');
  });

  it('sorts combined results by date descending', async () => {
    const articleA = createMockArticle('Guardian', 'A', '2023-01-01T00:00:00Z');
    const articleB = createMockArticle('NYT', 'B', '2023-01-03T00:00:00Z');
    const articleC = createMockArticle('NewsAPI', 'C', '2023-01-02T00:00:00Z');

    guardianSpy.mockResolvedValue([articleA]);
    nytSpy.mockResolvedValue([articleB]);
    newsApiSpy.mockResolvedValue([articleC]);

    const results = await fetchAllNews({ keyword: 'sort' }, [
      SOURCES.THE_GUARDIAN,
      SOURCES.NY_TIMES,
      SOURCES.NEWS_API,
    ]);

    expect(results).toHaveLength(3);
    expect(results[0].title).toBe('B');
    expect(results[1].title).toBe('C');
    expect(results[2].title).toBe('A');
  });
});
