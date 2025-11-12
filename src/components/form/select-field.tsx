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
  valueType?: "string" | "number";
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onValueChange?: (value: string | number) => void;
}

export function SelectField({
  options,
  valueType = "string",
  placeholder,
  disabled,
  className,
  onValueChange,
}: SelectFieldProps) {
  const field = useFieldContext<string | number>();

  const handleValueChange = (value: string) => {
    const typedValue = valueType === "number" ? Number(value) : value;
    field.handleChange(typedValue);
    onValueChange?.(typedValue);
  };

  return (
    <Select
      value={String(field.state.value)}
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
  valueType?: "string" | "number";
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onValueChange?: (value: string | number) => void;
}

export function SelectSearchField({
  options,
  valueType = "string",
  placeholder,
  disabled,
  className,
  onValueChange,
}: SelectSearchFieldProps) {
  const field = useFieldContext<string | number>();

  const handleValueChange = (value: string) => {
    const typedValue = valueType === "number" ? Number(value) : value;
    field.handleChange(typedValue);
    onValueChange?.(typedValue);
  };

  return (
    <Combobox
      options={options}
      value={String(field.state.value)}
      placeholder={placeholder}
      disabled={disabled}
      onChange={handleValueChange}
      className={className}
    />
  );
}

interface MultiSelectFieldProps {
  options: Option[];
  valueType?: "string" | "number";
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onValueChange?: (value: string[] | number[]) => void;
}

export function MultiSelectField({
  options,
  valueType = "string",
  placeholder,
  disabled,
  className,
  onValueChange,
}: MultiSelectFieldProps) {
  const field = useFieldContext<string[] | number[]>();

  const handleValueChange = (selected: string[]) => {
    const typedValue = valueType === "number" ? selected.map(Number) : selected;
    field.handleChange(typedValue);
    onValueChange?.(typedValue);
  };

  return (
    <MultiSelect
      values={field.state.value.map(String)}
      onValuesChange={handleValueChange}
    >
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
