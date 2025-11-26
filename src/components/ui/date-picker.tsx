import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DatePickerProps {
  value?: Date;
  onValueChange?: (value: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export default function DatePicker({
  value,
  onValueChange,
  placeholder,
  className,
}: DatePickerProps) {
  const [date, setDate] = useState<Date | undefined>(value);
  const [open, setOpen] = useState(false);

  const handleValueChange = (value: Date | undefined) => {
    setDate(value);
    setOpen(false);
    onValueChange?.(value);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className={cn("w-full", className)}>
        <Button
          variant="outline"
          data-empty={!date}
          className="data-[empty=true]:text-muted-foreground justify-start text-left font-normal"
        >
          <CalendarIcon />
          {date ? format(date, "dd/MM/yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(value) => handleValueChange(value ?? date)}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
}
