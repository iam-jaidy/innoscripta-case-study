import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { CATEGORIES } from '@/lib/constants';
import { NYTimesAPI } from '..';

// Mock axios
vi.mock('axios');

describe('NYTimesAPI', () => {
  let api: NYTimesAPI;

  beforeEach(() => {
    api = new NYTimesAPI();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches Top Stories from "home" section by default', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: { results: [] },
    });

    await api.fetchArticles({});

    expect(axios.get).toHaveBeenCalledWith(
      'https://api.nytimes.com/svc/topstories/v2/home.json',
      expect.objectContaining({
        params: expect.objectContaining({ 'api-key': expect.any(String) }),
      })
    );
  });

  it('maps category to correct Top Stories section', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { results: [] } });

    await api.fetchArticles({ category: CATEGORIES.TECHNOLOGY });

    expect(axios.get).toHaveBeenCalledWith(
      'https://api.nytimes.com/svc/topstories/v2/technology.json',
      expect.any(Object)
    );
  });

  it('returns empty array if page > 0 for Top Stories', async () => {
    const results = await api.fetchArticles({ page: 1 });
    expect(results).toEqual([]);
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('fetches multiple sections in parallel when categories array is provided', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        results: [{ title: 'Article', url: 'http://url.com', section: 'foo' }],
      },
    });

    await api.fetchArticles({
      categories: [CATEGORIES.TECHNOLOGY, CATEGORIES.SPORTS],
    });

    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('technology.json'),
      expect.any(Object)
    );
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('sports.json'),
      expect.any(Object)
    );
  });

  it('deduplicates articles across multiple sections', async () => {
    const duplicateArticle = {
      title: 'AI Boom',
      url: 'https://nyt.com/ai',
      section: 'technology',
    };

    vi.mocked(axios.get).mockResolvedValue({
      data: { results: [duplicateArticle] },
    });

    const results = await api.fetchArticles({
      categories: [CATEGORIES.TECHNOLOGY, CATEGORIES.BUSINESS],
    });

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('AI Boom');
  });

  it('switches to Search API if keyword is provided', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: { response: { docs: [] } },
    });

    await api.fetchArticles({ keyword: 'election' });

    expect(axios.get).toHaveBeenCalledWith(
      'https://api.nytimes.com/svc/search/v2/articlesearch.json',
      expect.objectContaining({
        params: expect.objectContaining({
          q: 'election',
        }),
      })
    );
  });

  it('correctly constructs the "fq" (Filter Query) string', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: { response: { docs: [] } },
    });

    await api.fetchArticles({
      keyword: 'stocks',
      category: CATEGORIES.BUSINESS,
    });

    expect(axios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({
          fq: expect.stringContaining(
            '("Food" "Cooking" "Dining") AND (section_name:("Business") OR news_desk:("Business"))'
          ),
        }),
      })
    );
  });

  it('formats dates to YYYYMMDD for Search API', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: { response: { docs: [] } },
    });

    await api.fetchArticles({
      dateRange: {
        from: new Date('2023-01-01'),
        to: new Date('2023-12-31'),
      },
    });

    expect(axios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({
          begin_date: '20230101',
          end_date: '20231231',
        }),
      })
    );
  });

  it('prefixes relative image URLs from Search API', async () => {
    const mockSearchResponse = {
      data: {
        response: {
          docs: [
            {
              _id: '1',
              headline: { main: 'Test' },
              web_url: 'http://test.com',
              pub_date: '2023-01-01',
              multimedia: {
                default: {
                  url: 'images/2023/01/01/test.jpg',
                },
              },
            },
          ],
        },
      },
    };

    vi.mocked(axios.get).mockResolvedValue(mockSearchResponse);
    const results = await api.fetchArticles({ keyword: 'test' });

    expect(results[0].imageUrl).toBe('https://static01.nyt.com/images/2023/01/01/test.jpg');
  });

  it('handles absolute image URLs correctly (no double prefixing)', async () => {
    const mockSearchResponse = {
      data: {
        response: {
          docs: [
            {
              _id: '1',
              headline: { main: 'Test' },
              web_url: 'http://test.com',
              pub_date: '2023-01-01',
              multimedia: {
                default: {
                  url: 'https://cdn.nyt.com/image.jpg',
                },
              },
            },
          ],
        },
      },
    };

    vi.mocked(axios.get).mockResolvedValue(mockSearchResponse);
    const results = await api.fetchArticles({ keyword: 'test' });

    expect(results[0].imageUrl).toBe('https://cdn.nyt.com/image.jpg');
  });
});
