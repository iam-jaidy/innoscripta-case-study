import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CATEGORIES, SOURCES, type Category, type SourceName } from '@/lib/constants';
import { useState } from 'react';

export const SideBar = () => {
  const { preferences, setPreferences } = useAppStore();

  const preferencesKey = `${preferences.sources.join('|')}::${preferences.categories.join('|')}`;

  const [localPreferences, setLocalPreferences] = useState(() => ({
    sources: preferences.sources,
    categories: preferences.categories,
  }));

  const sameList = (a: string[], b: string[]) =>
    a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|');

  const hasChanges =
    !sameList(localPreferences.sources, preferences.sources) ||
    !sameList(localPreferences.categories, preferences.categories);

  const toggleSelection = <K extends keyof typeof localPreferences>(
    key: K,
    value: SourceName | Category
  ) => {
    setLocalPreferences((prev) => {
      const currentValues = prev[key] as (typeof value)[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];
      return { ...prev, [key]: newValues };
    });
  };

  const handleSave = () => {
    setPreferences(localPreferences);
  };

  return (
    <aside
      key={preferencesKey}
      className="sticky top-0 left-0 border-r border-sidebar-border bg-sidebar p-6 space-y-8 h-screen md:min-w-55"
    >
      <h2 className="text-lg font-semibold mb-4 text-sidebar-foreground">My Preferences</h2>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-sidebar-foreground/70">Sources:</h3>
        <div className="space-y-3">
          {Object.values(SOURCES).map((source) => (
            <div key={source} className="flex items-center space-x-2">
              <Checkbox
                id={source}
                checked={localPreferences.sources.includes(source)}
                onCheckedChange={() => toggleSelection('sources', source)}
              />
              <Label htmlFor={source} className="cursor-pointer">
                {source}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 mt-6">
        <h3 className="text-sm font-medium text-sidebar-foreground/70">Categories:</h3>
        <div className="space-y-3">
          {Object.values(CATEGORIES).map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={localPreferences.categories.includes(category)}
                onCheckedChange={() => toggleSelection('categories', category)}
              />
              <Label htmlFor={category} className="cursor-pointer capitalize">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full" onClick={handleSave} disabled={!hasChanges}>
        {hasChanges ? 'Save Preferences' : 'Saved'}
      </Button>
    </aside>
  );
};
