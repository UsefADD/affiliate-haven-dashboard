import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeSelectorProps {
  onDateChange: (range: DateRange) => void;
}

export function DateRangeSelector({ onDateChange }: DateRangeSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date()
  });

  const handlePresetClick = (preset: string) => {
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

    setDateRange({ from, to });
    onDateChange({ from, to });
    setIsCalendarOpen(false);
  };

  const handleCustomRangeSelect = (range: { from?: Date; to?: Date }) => {
    if (range.from && range.to) {
      setDateRange({ from: range.from, to: range.to });
      onDateChange({ from: range.from, to: range.to });
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:gap-4">
        <div className="w-[200px] space-y-1">
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
            onClick={() => handlePresetClick("today")}
          >
            Today
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
            onClick={() => handlePresetClick("yesterday")}
          >
            Yesterday
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
            onClick={() => handlePresetClick("last7")}
          >
            Last 7 Days
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
            onClick={() => handlePresetClick("last30")}
          >
            Last 30 Days
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
            onClick={() => handlePresetClick("thisMonth")}
          >
            This Month
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
            onClick={() => handlePresetClick("lastMonth")}
          >
            Last Month
          </Button>
        </div>

        <div>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Custom Range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={{
                  from: dateRange?.from,
                  to: dateRange?.to,
                }}
                onSelect={handleCustomRangeSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}