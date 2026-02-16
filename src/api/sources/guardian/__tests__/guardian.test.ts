import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { CATEGORIES } from '@/lib/constants';
import { GuardianAPI } from '..';

vi.mock('axios');

describe('GuardianAPI', () => {
  let api: GuardianAPI;

  beforeEach(() => {
    api = new GuardianAPI();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('correctly constructs query parameters', async () => {
    const mockResponse = {
      data: { response: { results: [] } },
    };

    vi.mocked(axios.get).mockResolvedValue(mockResponse);

    const date = new Date('2023-01-01');
    await api.fetchArticles({
      keyword: 'climate',
      page: 0,
      category: CATEGORIES.SPORTS,
      dateRange: { from: date },
    });

    expect(axios.get).toHaveBeenCalledWith(
      'https://content.guardianapis.com/search',
      expect.objectContaining({
        params: expect.objectContaining({
          q: 'climate',
          page: 1,
          section: 'sport',
          'from-date': '2023-01-01',
        }),
      })
    );
  });

  it('selects the largest image asset correctly', async () => {
    const mockResponse = {
      data: {
        response: {
          results: [
            {
              id: '1',
              webTitle: 'Test Article',
              webPublicationDate: '2023-01-01T00:00:00Z',
              webUrl: 'http://test.com',
              elements: [
                {
                  relation: 'main',
                  type: 'image',
                  assets: [
                    { typeData: { width: '100' }, file: 'small.jpg' },
                    { typeData: { width: '1000' }, file: 'large.jpg' },
                    { typeData: { width: '500' }, file: 'medium.jpg' },
                  ],
                },
              ],
            },
          ],
        },
      },
    };

    vi.mocked(axios.get).mockResolvedValue(mockResponse);

    const results = await api.fetchArticles({ keyword: 'test' });

    expect(results[0].imageUrl).toBe('large.jpg');
  });

  it('returns empty array on API failure', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('Network Error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const results = await api.fetchArticles({ keyword: 'fail' });

    expect(results).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
  });
});
