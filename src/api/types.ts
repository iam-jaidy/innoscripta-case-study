import type { Category } from '@/lib/constants';

export type Article = {
  id: string;
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  source: string;
  url: string;
  imageUrl: string;
  category?: string;
};

export type SearchParams = {
  keyword?: string;
  category?: Category;
  categories?: Category[];
  dateRange?: {
    from: Date;
    to?: Date;
  };
  source?: string;
  page?: number;
};

export type NewsSource = {
  fetchArticles: (params: SearchParams) => Promise<Article[]>;
};
