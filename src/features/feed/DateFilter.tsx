import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppStore } from '@/store/useAppStore';

export function DateFilter() {
  const { filters, setFilters } = useAppStore();

  const date: DateRange | undefined = filters.dateRange
    ? { from: filters.dateRange.from, to: filters.dateRange.to }
    : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={'outline'}
          className={`justify-start text-left font-normal ${!date && 'text-muted-foreground'}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
              </>
            ) : (
              format(date.from, 'LLL dd, y')
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          autoFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={(range) => {
            if (range?.from) {
              setFilters({
                dateRange: { from: range.from, to: range.to },
              });
            } else {
              setFilters({ dateRange: undefined });
            }
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
