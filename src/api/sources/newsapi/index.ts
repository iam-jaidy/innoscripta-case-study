import type { Article, NewsSource, SearchParams } from '@/api/types';
import axios from 'axios';
import type { NewsAPIResponse } from './types';

export class NewsAPIAdapter implements NewsSource {
  async fetchArticles(params: SearchParams): Promise<Article[]> {
    const hasMultipleCategories = params.categories && params.categories.length > 0;
    const useEverythingEndpoint = !!params.keyword || !!params.dateRange || hasMultipleCategories;

    const endpoint = useEverythingEndpoint
      ? 'https://newsapi.org/v2/everything'
      : 'https://newsapi.org/v2/top-headlines';

    const queryParams: Record<string, string | number | undefined> = {
      apiKey: import.meta.env.VITE_NEWSAPI_API_KEY,
      pageSize: 12,
      page: (params.page || 0) + 1,
    };

    if (useEverythingEndpoint) {
      queryParams.excludeDomains = 'theguardian.com,nytimes.com';
      if (params.dateRange) {
        queryParams.from = params.dateRange.from.toISOString().split('T')[0];
        if (params.dateRange.to) {
          queryParams.to = params.dateRange.to.toISOString().split('T')[0];
        }
      }

      if (params.keyword) {
        queryParams.q = params.keyword;

        if (params.category) {
          queryParams.q = `${params.keyword} AND ${params.category}`;
        }
      } else if (params.categories && params.categories.length > 0) {
        queryParams.q = params.categories.join(' OR ');
      } else if (params.category) {
        queryParams.q = params.category;
      } else {
        queryParams.q = '*';
      }

      queryParams.sortBy = 'publishedAt';
    } else {
      queryParams.country = 'us';

      if (params.category) {
        queryParams.category = params.category;
      }
    }

    try {
      const { data } = await axios.get<NewsAPIResponse>(endpoint, {
        params: queryParams,
      });

      return data.articles.map((item) => {
        const { title, description, author, source, publishedAt, url, urlToImage } = item;
        return {
          id: url,
          title: title,
          description: description || '',
          author: author || source.name || 'NewsAPI',
          publishedAt: publishedAt,
          source: source.name || 'NewsAPI',
          url,
          imageUrl: urlToImage || 'https://placehold.co/600x400?text=No+Image',
        };
      });
    } catch (error) {
      console.error('NewsAPI error:', error);
      return [];
    }
  }
}
