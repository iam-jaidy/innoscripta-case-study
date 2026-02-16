import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SourceLogo from '@/components/SourceLogo';

describe('SourceLogo', () => {
  it('builds favicon url from domain (strips www.)', () => {
    render(<SourceLogo source="BBC" url="https://www.bbc.com/news" />);
    const img = screen.getByRole('img', { name: /bbc logo/i }) as HTMLImageElement;
    expect(img.src).toContain('domain=bbc.com');
    expect(img.src).toContain('sz=64');
  });

  it('hides image on error', () => {
    render(<SourceLogo source="BBC" url="https://www.bbc.com/news" />);
    const img = screen.getByRole('img', { name: /bbc logo/i }) as HTMLImageElement;
    fireEvent.error(img);
    expect(img.style.display).toBe('none');
  });
});
