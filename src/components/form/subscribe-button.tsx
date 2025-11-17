import { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import { Button, buttonVariants } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { useFormContext } from ".";

interface SubscribeButtonProps {
  label: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  children?: React.ReactNode;
  className?: string;
}

export default function SubscribeButton({
  label,
  variant,
  size,
  children,
  className,
}: SubscribeButtonProps) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button
          variant={variant}
          size={size}
          disabled={isSubmitting}
          className={cn("", className)}
        >
          {isSubmitting ? <Spinner /> : children}
          {label}
        </Button>
      )}
    </form.Subscribe>
  );
}
