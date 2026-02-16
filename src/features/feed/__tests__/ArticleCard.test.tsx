import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Article } from '@/api/types';

type SourceLogoProps = { source: string; url: string };

vi.mock('@/components/SourceLogo', () => ({
  default: ({ source, url }: SourceLogoProps) => (
    <div data-testid="source-logo">
      {source}::{url}
    </div>
  ),
}));

vi.mock(import('@/lib/utils'), async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/utils')>();
  return {
    ...actual,
    formatDate: (iso: string) => `formatted:${iso}`,
  };
});

import ArticleCard from '@/features/feed/ArticleCard';

const mkArticle = (overrides: Partial<Article>): Article => ({
  id: overrides.id ?? 'id-1',
  title: overrides.title ?? 'Some title',
  description: overrides.description ?? '<p>Hello</p>',
  url: overrides.url ?? 'https://example.com/read',
  publishedAt: overrides.publishedAt ?? '2024-01-02T10:00:00.000Z',
  source: overrides.source ?? 'The Guardian',
  imageUrl: overrides.imageUrl ?? 'https://example.com/image.jpg',
  author: overrides.author ?? 'Author',
});

describe('ArticleCard', () => {
  it('renders title and image', () => {
    const article = mkArticle({
      title: 'My Article',
      imageUrl: 'https://cdn.test/img.png',
    });

    render(<ArticleCard article={article} />);

    expect(screen.getByText('My Article')).toBeTruthy();

    const img = screen.getByAltText('My Article') as HTMLImageElement;
    expect(img.src).toContain('https://cdn.test/img.png');
  });

  it('sanitizes description and applies hook to anchors', () => {
    const article = mkArticle({
      description: '<p>Hi <a href="https://evil.test">link</a><script>window.XSS=1</script></p>',
    });

    const { container } = render(<ArticleCard article={article} />);

    const anchor = container.querySelector('p a') as HTMLAnchorElement | null;
    expect(anchor).toBeTruthy();

    if (anchor) {
      expect(anchor.getAttribute('target')).toBe('_blank');
      expect(anchor.getAttribute('rel')).toBe('noopener noreferrer');
    }

    expect(container.querySelector('script')).toBeNull();
  });

  it('renders the Read More link with safe attributes', () => {
    const article = mkArticle({ url: 'https://news.test/story/' });

    render(<ArticleCard article={article} />);

    const link = screen.getByRole('link', { name: 'Read More' }) as HTMLAnchorElement;
    expect(link.href).toBe('https://news.test/story/');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('passes source and url to SourceLogo', () => {
    const article = mkArticle({ source: 'NY Times', url: 'https://nyt.test/a' });

    render(<ArticleCard article={article} />);

    expect(screen.getByTestId('source-logo').textContent).toBe('NY Times::https://nyt.test/a');
  });

  it('renders formatted date', () => {
    const article = mkArticle({ publishedAt: '2024-02-01T00:00:00.000Z' });

    render(<ArticleCard article={article} />);

    expect(screen.getByText('formatted:2024-02-01T00:00:00.000Z')).toBeTruthy();
  });
});
