import { cn } from "@/lib/utils";

import { Combobox, Option } from "../ui/combobox";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "../ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useFieldContext } from ".";

interface SelectFieldProps {
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onValueChange?: (value: string) => void;
}

export function SelectField({
  options,
  placeholder,
  disabled,
  className,
  onValueChange,
}: SelectFieldProps) {
  const field = useFieldContext<string>();

  const handleValueChange = (value: string) => {
    field.handleChange(value);
    onValueChange?.(value);
  };

  return (
    <Select
      value={field.state.value}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          "!h-auto w-full whitespace-normal break-words text-start",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="w-[var(--radix-select-trigger-width)]">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface SelectSearchFieldProps {
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onValueChange?: (value: string) => void;
}

export function SelectSearchField({
  options,
  placeholder,
  disabled,
  className,
  onValueChange,
}: SelectSearchFieldProps) {
  const field = useFieldContext<string>();

  const handleValueChange = (value: string) => {
    field.handleChange(value);
    onValueChange?.(value);
  };

  return (
    <Combobox
      options={options}
      value={field.state.value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={handleValueChange}
      className={className}
    />
  );
}

interface MultiSelectFieldProps {
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onValueChange?: (value: string[]) => void;
}

export function MultiSelectField({
  options,
  placeholder,
  disabled,
  className,
  onValueChange,
}: MultiSelectFieldProps) {
  const field = useFieldContext<string[]>();

  const handleValueChange = (selected: string[]) => {
    field.handleChange(selected);
    onValueChange?.(selected);
  };

  return (
    <MultiSelect values={field.state.value} onValuesChange={handleValueChange}>
      <MultiSelectTrigger
        disabled={disabled}
        className={cn("w-full", className)}
      >
        <MultiSelectValue placeholder={placeholder} />
      </MultiSelectTrigger>
      <MultiSelectContent>
        <MultiSelectGroup>
          {options.map((option) => (
            <MultiSelectItem key={option.value} value={option.value}>
              {option.label}
            </MultiSelectItem>
          ))}
        </MultiSelectGroup>
      </MultiSelectContent>
    </MultiSelect>
  );
}
