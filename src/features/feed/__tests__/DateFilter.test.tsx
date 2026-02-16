import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

type StoreDateRange = { from: Date; to?: Date };
type Filters = { dateRange?: StoreDateRange };
type Store = { filters: Filters; setFilters: (payload: Filters) => void };

const setFiltersSpy = vi.fn<(payload: Filters) => void>();

const store: Store = {
  filters: {},
  setFilters: setFiltersSpy,
};

vi.mock('@/store/useAppStore', () => ({
  useAppStore: (): Store => store,
}));

type CalendarProps = {
  selected?: { from?: Date; to?: Date };
  onSelect?: (range: { from?: Date; to?: Date } | undefined) => void;
};

vi.mock('@/components/ui/calendar', () => ({
  Calendar: ({ onSelect }: CalendarProps) => (
    <div>
      <button
        type="button"
        onClick={() => onSelect?.({ from: new Date('2024-01-01T00:00:00.000Z'), to: undefined })}
      >
        select-from
      </button>
      <button
        type="button"
        onClick={() =>
          onSelect?.({
            from: new Date('2024-01-01T00:00:00.000Z'),
            to: new Date('2024-01-10T00:00:00.000Z'),
          })
        }
      >
        select-range
      </button>
      <button type="button" onClick={() => onSelect?.(undefined)}>
        clear
      </button>
    </div>
  ),
}));

type ButtonProps = {
  id?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

vi.mock('@/components/ui/button', () => ({
  Button: ({ id, children, className, onClick }: ButtonProps) => (
    <button id={id} className={className} onClick={onClick}>
      {children}
    </button>
  ),
}));

type PopoverProps = { children: React.ReactNode };
type PopoverTriggerProps = { asChild?: boolean; children: React.ReactNode };
type PopoverContentProps = { children: React.ReactNode };

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: PopoverProps) => <div>{children}</div>,
  PopoverTrigger: ({ children }: PopoverTriggerProps) => <div>{children}</div>,
  PopoverContent: ({ children }: PopoverContentProps) => <div>{children}</div>,
}));

vi.mock('lucide-react', () => ({
  Calendar: () => <span aria-hidden="true">icon</span>,
}));

import { DateFilter } from '@/features/feed/DateFilter';

describe('DateFilter', () => {
  beforeEach(() => {
    store.filters = {};
    setFiltersSpy.mockReset();
  });

  it('shows placeholder when no dateRange is set', () => {
    render(<DateFilter />);
    expect(screen.getByText('Pick a date range')).toBeTruthy();
  });

  it('shows formatted single date when only from is set', () => {
    store.filters = { dateRange: { from: new Date('2024-01-01T00:00:00.000Z') } };

    render(<DateFilter />);

    expect(screen.getByText('Jan 01, 2024')).toBeTruthy();
  });

  it('shows formatted range when from and to are set', () => {
    store.filters = {
      dateRange: {
        from: new Date('2024-01-01T00:00:00.000Z'),
        to: new Date('2024-01-10T00:00:00.000Z'),
      },
    };

    render(<DateFilter />);

    expect(screen.getByText('Jan 01, 2024 - Jan 10, 2024')).toBeTruthy();
  });

  it('sets dateRange when a from date is selected', () => {
    render(<DateFilter />);

    screen.getByText('select-from').click();

    expect(setFiltersSpy).toHaveBeenCalledTimes(1);
    expect(setFiltersSpy).toHaveBeenCalledWith({
      dateRange: { from: new Date('2024-01-01T00:00:00.000Z'), to: undefined },
    });
  });

  it('sets dateRange when a full range is selected', () => {
    render(<DateFilter />);

    screen.getByText('select-range').click();

    expect(setFiltersSpy).toHaveBeenCalledTimes(1);
    expect(setFiltersSpy).toHaveBeenCalledWith({
      dateRange: {
        from: new Date('2024-01-01T00:00:00.000Z'),
        to: new Date('2024-01-10T00:00:00.000Z'),
      },
    });
  });

  it('clears dateRange when selection is cleared', () => {
    store.filters = { dateRange: { from: new Date('2024-01-01T00:00:00.000Z') } };

    render(<DateFilter />);

    screen.getByText('clear').click();

    expect(setFiltersSpy).toHaveBeenCalledTimes(1);
    expect(setFiltersSpy).toHaveBeenCalledWith({ dateRange: undefined });
  });
});
