import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

type Article = {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  imageUrl: string;
  author: string;
};

type StateShape = {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
};

type PaginationShape = {
  hasNextPage: boolean;
  loadMoreRef: (node: HTMLElement | null) => void;
};

type HookReturn = {
  articles: Article[];
  state: StateShape;
  error: unknown;
  pagination: PaginationShape;
};

const hookValue: HookReturn = {
  articles: [],
  state: { isLoading: false, isError: false, isEmpty: false },
  error: undefined,
  pagination: {
    hasNextPage: false,
    loadMoreRef: () => undefined,
  },
};

vi.mock('@/hooks/useNewsFeedLogic', () => ({
  default: (): HookReturn => hookValue,
}));

type ArticleCardProps = { article: Article };

vi.mock('@/features/feed/ArticleCard', () => ({
  default: ({ article }: ArticleCardProps) => <div data-testid="article-card">{article.id}</div>,
}));

type SkeletonProps = { className?: string };

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: SkeletonProps) => <div data-testid="skeleton" className={className} />,
}));

vi.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader-icon" />,
}));

import NewsFeed from '@/features/feed/NewsFeed';

describe('NewsFeed', () => {
  beforeEach(() => {
    hookValue.articles = [];
    hookValue.state = { isLoading: false, isError: false, isEmpty: false };
    hookValue.error = undefined;
    hookValue.pagination = {
      hasNextPage: false,
      loadMoreRef: () => undefined,
    };
  });

  it('renders loading skeletons when loading', () => {
    hookValue.state = { isLoading: true, isError: false, isEmpty: false };

    render(<NewsFeed />);

    expect(screen.getAllByTestId('skeleton').length).toBe(18);
  });

  it('renders error state with error message', () => {
    hookValue.state = { isLoading: false, isError: true, isEmpty: false };
    hookValue.error = new Error('Network down');

    render(<NewsFeed />);

    expect(screen.getByText('Something went wrong fetching the news.')).toBeTruthy();
    expect(screen.getByText('Network down')).toBeTruthy();
  });

  it('renders empty state when no articles', () => {
    hookValue.state = { isLoading: false, isError: false, isEmpty: true };

    render(<NewsFeed />);

    expect(screen.getByText('No articles found. Try adjusting your search filters.')).toBeTruthy();
  });

  it('renders list of articles when available', () => {
    hookValue.state = { isLoading: false, isError: false, isEmpty: false };
    hookValue.articles = [
      {
        id: 'a1',
        title: 't',
        description: 'd',
        url: 'https://a',
        publishedAt: '2024-01-01T00:00:00.000Z',
        source: 'The Guardian',
        imageUrl: 'https://img',
        author: 'x',
      },
      {
        id: 'a2',
        title: 't2',
        description: 'd2',
        url: 'https://b',
        publishedAt: '2024-01-02T00:00:00.000Z',
        source: 'NY Times',
        imageUrl: 'https://img2',
        author: 'y',
      },
    ];

    render(<NewsFeed />);

    const cards = screen.getAllByTestId('article-card');
    expect(cards.length).toBe(2);
    expect(cards[0].textContent).toBe('a1');
    expect(cards[1].textContent).toBe('a2');
  });

  it('renders loader sentinel when hasNextPage is true', () => {
    hookValue.state = { isLoading: false, isError: false, isEmpty: false };
    hookValue.articles = [
      {
        id: 'a1',
        title: 't',
        description: 'd',
        url: 'https://a',
        publishedAt: '2024-01-01T00:00:00.000Z',
        source: 'The Guardian',
        imageUrl: 'https://img',
        author: 'x',
      },
    ];
    hookValue.pagination = {
      hasNextPage: true,
      loadMoreRef: () => undefined,
    };

    render(<NewsFeed />);

    expect(screen.getByTestId('loader-icon')).toBeTruthy();
  });
});
