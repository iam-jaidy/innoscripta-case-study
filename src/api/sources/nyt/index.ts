import type { Article, NewsSource, SearchParams } from '@/api/types';
import axios, { type AxiosResponse } from 'axios';
import type { NYTResponse, NYTTopStoriesResponse, NYTTopStoryRaw, NYTArticleRaw } from './types';
import { CATEGORIES } from '@/lib/constants';
import { format } from 'date-fns';

const NYT_CATEGORY_MAP: Record<string, string> = {
  [CATEGORIES.TECHNOLOGY]: 'technology',
  [CATEGORIES.BUSINESS]: 'business',
  [CATEGORIES.SPORTS]: 'sports',
  [CATEGORIES.HEALTH]: 'health',
  [CATEGORIES.SCIENCE]: 'science',
  [CATEGORIES.ENTERTAINMENT]: 'arts',
  [CATEGORIES.GENERAL]: 'home',
};

const NYT_SECTION_SEARCH_MAP: Record<string, string> = {
  [CATEGORIES.TECHNOLOGY]: 'Technology',
  [CATEGORIES.BUSINESS]: 'Business',
  [CATEGORIES.SPORTS]: 'Sports',
  [CATEGORIES.HEALTH]: 'Health',
  [CATEGORIES.SCIENCE]: 'Science',
  [CATEGORIES.ENTERTAINMENT]: 'Arts',
  [CATEGORIES.GENERAL]: 'U.S.',
};

export class NYTimesAPI implements NewsSource {
  async fetchArticles(params: SearchParams): Promise<Article[]> {
    const apiKey = import.meta.env.VITE_NY_TIMES_API_KEY;
    const isSearchMode = !!params.keyword || !!params.dateRange;

    try {
      if (isSearchMode) {
        return await this.fetchFromSearchApi(params, apiKey);
      }
      if (params.categories && params.categories.length > 0) {
        return await this.fetchFromTopStoriesMulti(params, apiKey);
      }

      return await this.fetchFromTopStories(params, apiKey);
    } catch (error) {
      console.error('NYTimes API error:', error);
      return [];
    }
  }

  private async fetchFromTopStories(params: SearchParams, apiKey: string): Promise<Article[]> {
    if (params.page && params.page > 0) {
      return [];
    }

    const section =
      params.category && NYT_CATEGORY_MAP[params.category]
        ? NYT_CATEGORY_MAP[params.category]
        : 'home';

    const { data } = await axios.get<NYTTopStoriesResponse>(
      `https://api.nytimes.com/svc/topstories/v2/${section}.json`,
      { params: { 'api-key': apiKey } }
    );

    return this.normalizeTopStories(
      (data.results ?? []).filter((item) => item.section !== 'admin' && item.title)
    );
  }

  private async fetchFromTopStoriesMulti(params: SearchParams, apiKey: string): Promise<Article[]> {
    if (params.page && params.page > 0) return [];

    const sections = Array.from(
      new Set(params.categories?.map((c) => NYT_CATEGORY_MAP[c]).filter(Boolean))
    );

    const settled = await Promise.allSettled(
      sections.map((section) =>
        axios.get<NYTTopStoriesResponse>(
          `https://api.nytimes.com/svc/topstories/v2/${section}.json`,
          { params: { 'api-key': apiKey } }
        )
      )
    );

    const allResults: NYTTopStoryRaw[] = settled
      .filter(
        (result): result is PromiseFulfilledResult<AxiosResponse<NYTTopStoriesResponse>> =>
          result.status === 'fulfilled'
      )
      .flatMap((result) => result.value.data.results ?? [])
      .filter((item) => item.section !== 'admin' && Boolean(item.title));

    const unique = new Map<string, NYTTopStoryRaw>();
    allResults.forEach((item) => {
      unique.set(item.url, item);
    });

    return this.normalizeTopStories(Array.from(unique.values()));
  }

  private async fetchFromSearchApi(params: SearchParams, apiKey: string): Promise<Article[]> {
    const queryParams: Record<string, string | number | undefined> = {
      'api-key': apiKey,
      page: params.page || 0,
    };

    if (!params.keyword) {
      queryParams.sort = 'newest';
    }

    if (params.keyword) {
      queryParams.q = params.keyword;
    }

    if (params.dateRange) {
      queryParams.begin_date = format(params.dateRange.from, 'yyyyMMdd');
      if (params.dateRange.to) {
        queryParams.end_date = format(params.dateRange.to, 'yyyyMMdd');
      }
    }

    const fqParts: string[] = [
      '-type_of_material:("Recipe" "Ingredient")',
      '-news_desk:("Food" "Cooking" "Dining")',
    ];

    if (params.category) {
      const section = NYT_SECTION_SEARCH_MAP[params.category];
      if (section) {
        fqParts.push(`(section_name:("${section}") OR news_desk:("${section}"))`);
      }
    }

    if (fqParts.length) {
      queryParams.fq = fqParts.join(' AND ');
    }

    const { data } = await axios.get<NYTResponse>(
      'https://api.nytimes.com/svc/search/v2/articlesearch.json',
      { params: queryParams }
    );

    const docs: NYTArticleRaw[] = Array.isArray(data.response?.docs) ? data.response!.docs : [];

    return this.normalizeSearchResults(docs);
  }

  private normalizeTopStories(items: NYTTopStoryRaw[]): Article[] {
    return items.map((item) => ({
      id: item.uri ?? item.url,
      title: item.title,
      description: item.abstract ?? '',
      author: item.byline?.replace(/^By\s+/i, '') ?? 'New York Times',
      publishedAt: item.published_date,
      source: 'New York Times',
      url: item.url,
      imageUrl: item.multimedia?.[0]?.url ?? 'https://placehold.co/600x400?text=No+Image',
    }));
  }

  private normalizeSearchResults(items: NYTArticleRaw[]): Article[] {
    return items.map((item) => {
      const rawImage = item.multimedia?.default?.url;

      const imageUrl = rawImage
        ? rawImage.startsWith('http')
          ? rawImage
          : `https://static01.nyt.com/${rawImage}`
        : 'https://placehold.co/600x400?text=No+Image';

      return {
        id: item._id,
        title: item.headline?.main ?? 'Untitled',
        description: item.snippet ?? item.abstract ?? '',
        author: item.byline?.original?.replace(/^By\s+/i, '') ?? 'New York Times',
        publishedAt: item.pub_date,
        source: 'New York Times',
        url: item.web_url,
        imageUrl,
      };
    });
  }
}
