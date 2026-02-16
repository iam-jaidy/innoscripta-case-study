type NewsAPISource = {
  id: string | null;
  name: string;
};

type NewsAPIArticleRaw = {
  source: NewsAPISource;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
};

export type NewsAPIResponse = {
  status: string;
  totalResults: number;
  articles: NewsAPIArticleRaw[];
};
