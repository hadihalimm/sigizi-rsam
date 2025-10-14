import { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import { Input } from "../ui/input";
import { useFieldContext } from ".";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  className?: string;
}

export default function TextField({
  placeholder,
  className,
  ...inputProps
}: TextFieldProps) {
  const field = useFieldContext<string>();
  // const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <div className="flex flex-col">
      <Input
        id={field.name}
        type="text"
        value={field.state.value}
        placeholder={placeholder}
        autoComplete="off"
        className={cn("", className)}
        onChange={(e) => field.handleChange(e.target.value)}
        {...inputProps}
      />

      {/* {field.state.meta.isTouched &&
        errors.map((error: string) => (
          <div key={error} className="flex items-center gap-x-1">
            <AlertCircle size="15" className="text-destructive" />
            <p className="text-xs text-destructive">{error}</p>
          </div>
        ))} */}
    </div>
  );
}
