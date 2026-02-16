import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

type FiltersPayload = { keyword?: string };
type Store = { setFilters: (payload: FiltersPayload) => void };

const setFiltersSpy = vi.fn<(payload: FiltersPayload) => void>();
const store: Store = { setFilters: setFiltersSpy };

vi.mock('@/store/useAppStore', () => ({
  useAppStore: (): Store => store,
}));

type InputGroupProps = { className?: string; children: React.ReactNode };
type InputGroupInputProps = {
  placeholder?: string;
  value?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};
type InputGroupAddonProps = { children: React.ReactNode };

vi.mock('@/components/ui/input-group', () => ({
  InputGroup: ({ children }: InputGroupProps) => <div>{children}</div>,
  InputGroupInput: ({ placeholder, value, onChange }: InputGroupInputProps) => (
    <input placeholder={placeholder} value={value ?? ''} onChange={onChange} />
  ),
  InputGroupAddon: ({ children }: InputGroupAddonProps) => <div>{children}</div>,
}));

vi.mock('lucide-react', () => ({
  Search: () => <span aria-hidden="true">icon</span>,
}));

import SearchBar from '@/features/feed/SearchBar';

describe('SearchBar', () => {
  beforeEach(() => {
    setFiltersSpy.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not call setFilters immediately', () => {
    render(<SearchBar />);

    const input = screen.getByPlaceholderText('Search for articles...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hello' } });

    expect(setFiltersSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(499);
    expect(setFiltersSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(setFiltersSpy).toHaveBeenCalledTimes(1);
    expect(setFiltersSpy).toHaveBeenCalledWith({ keyword: 'hello' });
  });

  it('sets keyword undefined when value is empty/whitespace', () => {
    render(<SearchBar />);

    const input = screen.getByPlaceholderText('Search for articles...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '   ' } });

    vi.advanceTimersByTime(500);

    expect(setFiltersSpy).toHaveBeenCalledTimes(1);
    expect(setFiltersSpy).toHaveBeenCalledWith({ keyword: undefined });
  });

  it('debounces: only the last value is sent after 500ms', () => {
    render(<SearchBar />);

    const input = screen.getByPlaceholderText('Search for articles...') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'h' } });
    vi.advanceTimersByTime(250);

    fireEvent.change(input, { target: { value: 'he' } });
    vi.advanceTimersByTime(250);

    fireEvent.change(input, { target: { value: 'hel' } });

    vi.advanceTimersByTime(499);
    expect(setFiltersSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(setFiltersSpy).toHaveBeenCalledTimes(1);
    expect(setFiltersSpy).toHaveBeenCalledWith({ keyword: 'hel' });
  });

  it('sends the untrimmed value when non-empty (but trims only for emptiness check)', () => {
    render(<SearchBar />);

    const input = screen.getByPlaceholderText('Search for articles...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '  hello  ' } });

    vi.advanceTimersByTime(500);

    expect(setFiltersSpy).toHaveBeenCalledTimes(1);
    expect(setFiltersSpy).toHaveBeenCalledWith({ keyword: '  hello  ' });
  });
});
