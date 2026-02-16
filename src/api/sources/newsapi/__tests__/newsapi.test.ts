import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { NewsAPIAdapter } from '..';
import type { NewsAPIResponse } from '../types';

vi.mock('axios');

describe('NewsAPIAdapter', () => {
  let adapter: NewsAPIAdapter;

  beforeEach(() => {
    adapter = new NewsAPIAdapter();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses "top-headlines" endpoint by default (no filters)', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { articles: [] } });

    await adapter.fetchArticles({});

    expect(axios.get).toHaveBeenCalledWith(
      'https://newsapi.org/v2/top-headlines',
      expect.objectContaining({
        params: expect.objectContaining({
          country: 'us',
        }),
      })
    );
  });

  it('switches to "everything" endpoint if a keyword is provided', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { articles: [] } });

    await adapter.fetchArticles({ keyword: 'bitcoin' });

    expect(axios.get).toHaveBeenCalledWith(
      'https://newsapi.org/v2/everything',
      expect.objectContaining({
        params: expect.objectContaining({
          q: 'bitcoin',
          sortBy: 'publishedAt',
        }),
      })
    );
  });

  it('constructs complex query for Keyword + Category', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { articles: [] } });

    await adapter.fetchArticles({
      keyword: 'tesla',
      category: 'business',
    });

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('everything'),
      expect.objectContaining({
        params: expect.objectContaining({
          q: 'tesla AND business',
        }),
      })
    );
  });

  it('joins multiple categories with OR', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { articles: [] } });

    await adapter.fetchArticles({
      categories: ['technology', 'science'],
    });

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('everything'),
      expect.objectContaining({
        params: expect.objectContaining({
          q: 'technology OR science',
        }),
      })
    );
  });

  it('formats date ranges correctly', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { articles: [] } });

    const fromDate = new Date('2023-01-01');
    const toDate = new Date('2023-01-31');

    await adapter.fetchArticles({
      keyword: 'crypto',
      dateRange: { from: fromDate, to: toDate },
    });

    expect(axios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({
          from: '2023-01-01',
          to: '2023-01-31',
        }),
      })
    );
  });

  it('maps API response to Article interface correctly', async () => {
    const mockResponse: { data: NewsAPIResponse } = {
      data: {
        status: 'ok',
        totalResults: 1,
        articles: [
          {
            source: { id: 'wired', name: 'Wired' },
            author: 'John Doe',
            title: 'Test Article',
            description: 'Test Description',
            url: 'https://wired.com/story/1',
            urlToImage: null,
            publishedAt: '2023-10-10T10:00:00Z',
            content: '...',
          },
        ],
      },
    };

    vi.mocked(axios.get).mockResolvedValue(mockResponse);

    const articles = await adapter.fetchArticles({ keyword: 'tech' });

    expect(articles).toHaveLength(1);
    expect(articles[0]).toEqual({
      id: 'https://wired.com/story/1',
      title: 'Test Article',
      description: 'Test Description',
      author: 'John Doe',
      source: 'Wired',
      publishedAt: '2023-10-10T10:00:00Z',
      url: 'https://wired.com/story/1',
      imageUrl: 'https://placehold.co/600x400?text=No+Image',
    });
  });

  it('handles API errors gracefully', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('API Down'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const articles = await adapter.fetchArticles({ keyword: 'fail' });

    expect(articles).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
  });
});
