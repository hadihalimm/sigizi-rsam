"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useFieldContext } from ".";

interface DateFieldProps {
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function DateField({
  placeholder,
  disabled,
  className,
}: DateFieldProps) {
  const field = useFieldContext<Date>();
  const [open, setOpen] = useState(false);

  const handleValueChange = (value: Date | undefined) => {
    if (value) field.handleChange(value);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        className={cn("w-full", className)}
        disabled={disabled}
      >
        <Button
          variant="outline"
          data-empty={!field.state.value}
          className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
        >
          <CalendarIcon />
          {field.state.value ? (
            format(field.state.value, "dd/MM/yyyy")
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={field.state.value}
          onSelect={(value) => handleValueChange(value)}
          captionLayout="dropdown"
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}
