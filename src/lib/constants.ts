export const CATEGORIES = {
  BUSINESS: 'business',
  ENTERTAINMENT: 'entertainment',
  GENERAL: 'general',
  HEALTH: 'health',
  SCIENCE: 'science',
  SPORTS: 'sports',
  TECHNOLOGY: 'technology',
} as const;

export const SOURCES = {
  THE_GUARDIAN: 'The Guardian',
  NY_TIMES: 'New York Times',
  NEWS_API: 'NewsAPI',
} as const;

export type SourceName = (typeof SOURCES)[keyof typeof SOURCES];
export type Category = (typeof CATEGORIES)[keyof typeof CATEGORIES];
