import { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { useFieldContext } from ".";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  addonLeft?: React.ReactNode;
  addonRight?: React.ReactNode;
  className?: string;
}

export default function TextField({
  placeholder,
  addonLeft,
  addonRight,
  className,
  ...inputProps
}: TextFieldProps) {
  const field = useFieldContext<string>();

  return (
    <InputGroup>
      {addonLeft && <InputGroupAddon>{addonLeft}</InputGroupAddon>}
      <InputGroupInput
        id={field.name}
        type="text"
        value={field.state.value}
        placeholder={placeholder}
        autoComplete="off"
        className={cn("", className)}
        onChange={(e) => field.handleChange(e.target.value)}
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
