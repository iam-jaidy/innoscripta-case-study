import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

type Preferences = {
  sources: string[];
  categories: string[];
};

type Store = {
  preferences: Preferences;
  setPreferences: (p: Preferences) => void;
};

const store: Store = {
  preferences: {
    sources: ['The Guardian'],
    categories: ['business'],
  },
  setPreferences: vi.fn<(p: Preferences) => void>(),
};

vi.mock('@/store/useAppStore', () => ({
  useAppStore: (): Store => store,
}));

type CheckboxProps = {
  id: string;
  checked?: boolean;
  onCheckedChange?: () => void;
};

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ id, checked, onCheckedChange }: CheckboxProps) => (
    <input
      type="checkbox"
      aria-label={id}
      checked={Boolean(checked)}
      onChange={() => onCheckedChange?.()}
    />
  ),
}));

type ButtonProps = {
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
};

vi.mock('@/components/ui/button', () => ({
  Button: ({ disabled, onClick, children }: ButtonProps) => (
    <button disabled={Boolean(disabled)} onClick={onClick}>
      {children}
    </button>
  ),
}));

type LabelProps = {
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
};

vi.mock('@/components/ui/label', () => ({
  Label: ({ htmlFor, children }: LabelProps) => <label htmlFor={htmlFor}>{children}</label>,
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
    SPORTS: 'sports',
  },
}));

import { SideBar } from '@/components/SideBar';

describe('SideBar', () => {
  beforeEach(() => {
    store.preferences = {
      sources: ['The Guardian'],
      categories: ['business'],
    };
    (store.setPreferences as unknown as { mockReset: () => void }).mockReset();
  });

  it('renders all sources and categories', () => {
    const { getByLabelText, getByText } = render(<SideBar />);

    expect(getByText('My Preferences')).toBeTruthy();

    expect(getByLabelText('The Guardian')).toBeTruthy();
    expect(getByLabelText('NY Times')).toBeTruthy();
    expect(getByLabelText('News API')).toBeTruthy();

    expect(getByLabelText('business')).toBeTruthy();
    expect(getByLabelText('tech')).toBeTruthy();
    expect(getByLabelText('sports')).toBeTruthy();
  });

  it('disables save button when there are no changes', () => {
    const { getByRole } = render(<SideBar />);
    const btn = getByRole('button') as HTMLButtonElement;

    expect(btn.disabled).toBe(true);
    expect(btn.textContent).toBe('Saved');
  });

  it('enables save button when a selection changes', () => {
    const { getByRole, getByLabelText } = render(<SideBar />);
    const btn = getByRole('button') as HTMLButtonElement;

    expect(btn.disabled).toBe(true);

    const tech = getByLabelText('tech') as HTMLInputElement;
    tech.click();

    expect(btn.disabled).toBe(false);
    expect(btn.textContent).toBe('Save Preferences');
  });

  it('calls setPreferences with updated preferences on save', () => {
    const { getByRole, getByLabelText } = render(<SideBar />);

    const tech = getByLabelText('tech') as HTMLInputElement;
    tech.click();

    const btn = getByRole('button') as HTMLButtonElement;
    btn.click();

    expect(store.setPreferences).toHaveBeenCalledTimes(1);
    expect(store.setPreferences).toHaveBeenCalledWith({
      sources: ['The Guardian'],
      categories: ['business', 'tech'],
    });
  });

  it('syncs localPreferences when store preferences change externally', () => {
    const first = render(<SideBar />);

    const tech = first.getByLabelText('tech') as HTMLInputElement;
    tech.click();

    let btn = first.getByRole('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(false);

    store.preferences = {
      sources: ['NY Times'],
      categories: ['sports'],
    };

    first.unmount();

    const second = render(<SideBar />);

    const nyt = second.getByLabelText('NY Times') as HTMLInputElement;
    const sports = second.getByLabelText('sports') as HTMLInputElement;

    expect(nyt.checked).toBe(true);
    expect(sports.checked).toBe(true);

    btn = second.getByRole('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(btn.textContent).toBe('Saved');
  });
});
