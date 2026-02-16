type GuardianArticleRaw = {
  id: string;
  webTitle: string;
  webUrl: string;
  webPublicationDate: string;
  sectionName: string;
  fields?: {
    headline?: string;
    bodyText?: string;
    trailText?: string;
    byline?: string;
    thumbnail?: string;
  };
  elements?: {
    relation: string;
    type: string;
    assets: {
      file: string;
      typeData: {
        width: string;
        height: string;
      };
    }[];
  }[];
};

export type GuardianResponse = {
  response: {
    status: string;
    results: GuardianArticleRaw[];
  };
};
