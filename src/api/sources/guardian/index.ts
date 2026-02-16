import axios from 'axios';
import type { Article, NewsSource, SearchParams } from '../../types';
import type { GuardianResponse } from './types';
import { CATEGORIES } from '@/lib/constants';

const categoryMap: Record<string, string> = {
  [CATEGORIES.SPORTS]: 'sport',
  [CATEGORIES.HEALTH]: 'society',
  [CATEGORIES.ENTERTAINMENT]: 'culture',
};

export class GuardianAPI implements NewsSource {
  async fetchArticles(params: SearchParams): Promise<Article[]> {
    const queryParams: Record<string, string | number | undefined> = {
      'api-key': import.meta.env.VITE_THE_GUARDIAN_API_KEY,
      'show-fields': 'headline,trailText,byline,thumbnail',
      'show-elements': 'image',
      'page-size': 12,
      page: (params.page || 0) + 1,
    };

    if (params.keyword) {
      queryParams.q = params.keyword;
    }

    if (params.category) {
      queryParams.section = categoryMap[params.category] || params.category;
    }

    if (params.categories && params.categories.length > 0) {
      const mappedCategories = params.categories.map((cat) => categoryMap[cat] || cat).join('|');
      queryParams.section = mappedCategories;
    }

    if (params.dateRange) {
      queryParams['from-date'] = params.dateRange.from.toISOString().split('T')[0];
      if (params.dateRange.to) {
        queryParams['to-date'] = params.dateRange.to.toISOString().split('T')[0];
      }
    }

    try {
      const { data } = await axios.get<GuardianResponse>(
        'https://content.guardianapis.com/search',
        {
          params: queryParams,
        }
      );

      return data.response.results.map((item) => {
        const { id, webTitle, fields, webPublicationDate, webUrl } = item;

        const mainImageElement = item.elements?.find(
          (el) => el.relation === 'main' && el.type === 'image'
        );

        const assets = mainImageElement?.assets || [];

        const largestAsset = assets.sort((a, b) => {
          const widthA = parseInt(a?.typeData?.width || '0', 10);
          const widthB = parseInt(b?.typeData?.width || '0', 10);
          return widthB - widthA;
        })[0];

        const {
          thumbnail,
          trailText: description = '',
          byline: author = 'The Guardian',
        } = fields || {};

        const imageUrl =
          largestAsset?.file || thumbnail || 'https://placehold.co/600x400?text=No+Image';

        return {
          id,
          title: webTitle,
          description,
          author,
          publishedAt: webPublicationDate,
          source: 'The Guardian',
          url: webUrl,
          imageUrl,
        };
      });
    } catch (error) {
      console.error('Guardian API error:', error);
      return [];
    }
  }
}
