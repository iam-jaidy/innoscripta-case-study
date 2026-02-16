import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group';
import { useAppStore } from '@/store/useAppStore';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const SearchBar = () => {
  const [value, setValue] = useState('');
  const { setFilters } = useAppStore();

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters({ keyword: value.trim() === '' ? undefined : value });
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [value, setFilters]);

  return (
    <InputGroup className="w-full flex items-center">
      <InputGroupInput
        placeholder="Search for articles..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-10"
      />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
    </InputGroup>
  );
};

export default SearchBar;
