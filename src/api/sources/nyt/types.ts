type NYTMultiMedia = {
  caption: string;
  credit: string;
  default: {
    url: string;
    height: number;
    width: number;
  };
};

type NYTTopStoryMultimedia = {
  url: string;
  format: string;
  height: number;
  width: number;
  type: string;
  subtype: string;
  caption: string;
  copyright: string;
};

export type NYTArticleRaw = {
  _id: string;
  web_url: string;
  snippet: string;
  abstract: string;
  pub_date: string;
  headline: {
    main: string;
  };
  byline: {
    original: string;
  };
  multimedia: NYTMultiMedia | null;
  type_of_material: string;
  news_desk: string;
  section_name: string;
};

export type NYTTopStoryRaw = {
  section: string;
  subsection: string;
  title: string;
  abstract: string;
  url: string;
  uri: string;
  byline: string;
  item_type: string;
  updated_date: string;
  created_date: string;
  published_date: string;
  multimedia: NYTTopStoryMultimedia[] | null;
};

export type NYTResponse = {
  status: string;
  copyright: string;
  response: {
    docs: NYTArticleRaw[];
  };
};

export type NYTTopStoriesResponse = {
  status: string;
  copyright: string;
  section: string;
  last_updated: string;
  num_results: number;
  results: NYTTopStoryRaw[];
};
