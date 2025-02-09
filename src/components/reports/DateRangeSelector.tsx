
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeSelectorProps {
  onDateChange: (range: DateRange) => void;
}

export function DateRangeSelector({ onDateChange }: DateRangeSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: today,
    to: today
  });

  const handlePresetSelect = (preset: string) => {
    const today = new Date();
    let from = today;
    let to = today;

    switch (preset) {
      case "today":
        break;
      case "yesterday":
        from = subDays(today, 1);
        to = subDays(today, 1);
        break;
      case "last7":
        from = subDays(today, 6);
        break;
      case "last30":
        from = subDays(today, 29);
        break;
      case "thisMonth":
        from = startOfMonth(today);
        to = endOfMonth(today);
        break;
      case "lastMonth":
        const lastMonth = subMonths(today, 1);
        from = startOfMonth(lastMonth);
        to = endOfMonth(lastMonth);
        break;
    }

    const newRange = { from, to };
    setDateRange(newRange);
    onDateChange(newRange);
    setIsCalendarOpen(false);
  };

  const handleCustomRangeSelect = (range: DateRange | undefined) => {
    if (!range) return;
    
    // Set the new range with both from and to dates
    const newRange = {
      from: range.from,
      to: range.to || range.from
    };
    
    setDateRange(newRange);
    onDateChange(newRange);
    
    // Only close the popover when both dates are selected or a single date is selected
    if (range.to || !isCalendarOpen) {
      setIsCalendarOpen(false);
    }
  };

  return (
    <div>
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to && dateRange.from !== dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <Select onValueChange={handlePresetSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last7">Last 7 Days</SelectItem>
                <SelectItem value="last30">Last 30 Days</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={dateRange}
            onSelect={handleCustomRangeSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
