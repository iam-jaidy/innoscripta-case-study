import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  Select,
} from '@/components/ui/select';
import SearchBar from './SearchBar';
import { DateFilter } from '@/features/feed/DateFilter';
import { CATEGORIES, SOURCES, type Category, type SourceName } from '@/lib/constants';
import { capitalize } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import type { SearchParams } from '@/api/types';
import { MobileSidebar } from '@/components/MobileSideBar';

type DropdownFilterType = 'source' | 'category';

type DropdownSelectProps = {
  placeholder: string;
  items: SourceName[] | Category[];
  name: DropdownFilterType;
  value?: string;
  onChangeSelect: (value: string, name: DropdownFilterType) => void;
};

const DropdownSelect = ({
  placeholder,
  items,
  name,
  value,
  onChangeSelect,
}: DropdownSelectProps) => {
  return (
    <div className="flex-1 min-w-0 lg:w-40 lg:flex-none">
      <Select value={value} onValueChange={(v) => onChangeSelect(v, name)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="All">{placeholder}</SelectItem>
            {items.map((item) => (
              <SelectItem key={item} value={item}>
                {capitalize(item)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

const Filters = () => {
  const { setFilters, filters } = useAppStore();

  const onChangeSelect = (value: string, name: DropdownFilterType) => {
    if (value === 'All') {
      setFilters({ [name]: undefined } as Partial<SearchParams>);
      return;
    }
    setFilters({ [name]: value } as Partial<SearchParams>);
  };

  return (
    <div className="flex flex-col lg:flex-row md:items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-2 w-full lg:flex-1">
        <div className="md:hidden">
          <MobileSidebar />
        </div>
        <div className="flex-1 max-w-2xl">
          <SearchBar />
        </div>
      </div>

      <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full lg:w-auto lg:justify-end">
        <DropdownSelect
          placeholder="Source (All)"
          items={Object.values(SOURCES)}
          name="source"
          value={filters.source}
          onChangeSelect={onChangeSelect}
        />
        <DropdownSelect
          placeholder="Category (All)"
          items={Object.values(CATEGORIES)}
          name="category"
          value={filters.category}
          onChangeSelect={onChangeSelect}
        />
        <div className="shrink-0">
          <DateFilter />
        </div>
      </div>
    </div>
  );
};

export default Filters;
