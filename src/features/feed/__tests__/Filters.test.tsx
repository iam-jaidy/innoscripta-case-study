import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

type FiltersState = {
  source?: string;
  category?: string;
};

type Store = {
  filters: FiltersState;
  setFilters: (payload: Partial<FiltersState>) => void;
};

const setFiltersSpy = vi.fn<(payload: Partial<FiltersState>) => void>();

const store: Store = {
  filters: {},
  setFilters: setFiltersSpy,
};

vi.mock('@/store/useAppStore', () => ({
  useAppStore: (): Store => store,
}));

vi.mock('@/features/feed/DateFilter', () => ({
  DateFilter: () => <div data-testid="date-filter" />,
}));

vi.mock('@/features/feed/SearchBar', () => ({
  default: () => <div data-testid="search-bar" />,
}));

vi.mock('@/components/MobileSideBar', () => ({
  MobileSidebar: () => <div data-testid="mobile-sidebar" />,
}));

vi.mock('@/lib/constants', () => ({
  SOURCES: {
    THE_GUARDIAN: 'The Guardian',
    NY_TIMES: 'NY Times',
    NEWS_API: 'News API',
  },
  CATEGORIES: {
    BUSINESS: 'business',
    TECH: 'tech',
  },
}));

vi.mock(import('@/lib/utils'), async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/utils')>();
  return {
    ...actual,
    capitalize: (v: string) => v,
  };
});

type SelectProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
};

type SelectItemProps = {
  value: string;
  children: React.ReactNode;
};

type WrapperProps = {
  children: React.ReactNode;
  className?: string;
};

vi.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: SelectProps) => (
    <select
      value={value ?? ''}
      onChange={(e) => onValueChange?.((e.target as HTMLSelectElement).value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: WrapperProps) => <>{children}</>,
  SelectValue: ({ children }: WrapperProps) => <>{children}</>,
  SelectContent: ({ children }: WrapperProps) => <>{children}</>,
  SelectGroup: ({ children }: WrapperProps) => <>{children}</>,
  SelectItem: ({ value, children }: SelectItemProps) => <option value={value}>{children}</option>,
}));

import Filters from '@/features/feed/Filters';

describe('Filters', () => {
  beforeEach(() => {
    store.filters = {};
    setFiltersSpy.mockReset();
  });

  it('sets source to undefined when "All" is selected', () => {
    render(<Filters />);

    const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
    const sourceSelect = selects[0];

    sourceSelect.value = 'All';
    sourceSelect.dispatchEvent(new Event('change', { bubbles: true }));

    expect(setFiltersSpy).toHaveBeenCalledTimes(1);
    expect(setFiltersSpy).toHaveBeenCalledWith({ source: undefined });
  });

  it('sets source when a specific source is selected', () => {
    render(<Filters />);

    const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
    const sourceSelect = selects[0];

    sourceSelect.value = 'NY Times';
    sourceSelect.dispatchEvent(new Event('change', { bubbles: true }));

    expect(setFiltersSpy).toHaveBeenCalledTimes(1);
    expect(setFiltersSpy).toHaveBeenCalledWith({ source: 'NY Times' });
  });

  it('sets category to undefined when "All" is selected', () => {
    render(<Filters />);

    const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
    const categorySelect = selects[1];

    categorySelect.value = 'All';
    categorySelect.dispatchEvent(new Event('change', { bubbles: true }));

    expect(setFiltersSpy).toHaveBeenCalledTimes(1);
    expect(setFiltersSpy).toHaveBeenCalledWith({ category: undefined });
  });

  it('sets category when a specific category is selected', () => {
    render(<Filters />);

    const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
    const categorySelect = selects[1];

    categorySelect.value = 'tech';
    categorySelect.dispatchEvent(new Event('change', { bubbles: true }));

    expect(setFiltersSpy).toHaveBeenCalledTimes(1);
    expect(setFiltersSpy).toHaveBeenCalledWith({ category: 'tech' });
  });
});
