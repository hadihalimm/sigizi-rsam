import { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { useFieldContext } from ".";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  valueType?: "string" | "number";
  placeholder?: string;
  addonLeft?: React.ReactNode;
  addonRight?: React.ReactNode;
  className?: string;
}

export default function TextField({
  valueType = "string",
  placeholder,
  addonLeft,
  addonRight,
  className,
  ...inputProps
}: TextFieldProps) {
  const field = useFieldContext<string | number>();

  const handleValueChange = (value: string) => {
    const typedValue = valueType === "number" ? Number(value) : value;
    field.handleChange(typedValue);
  };

  return (
    <InputGroup>
      {addonLeft && <InputGroupAddon>{addonLeft}</InputGroupAddon>}
      <InputGroupInput
        id={field.name}
        type="text"
        value={field.state.value.toString()}
        placeholder={placeholder}
        autoComplete="off"
        className={cn("", className)}
        onChange={(e) => handleValueChange(e.target.value)}
        {...inputProps}
      />
      {addonRight && (
        <InputGroupAddon align="inline-end">{addonRight}</InputGroupAddon>
      )}
    </InputGroup>
  );
}

{
  /* <Input
  id={field.name}
  type="text"
  value={field.state.value}
  placeholder={placeholder}
  autoComplete="off"
  className={cn("", className)}
  onChange={(e) => field.handleChange(e.target.value)}
  {...inputProps}
/> */
}
