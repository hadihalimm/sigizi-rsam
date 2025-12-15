"use client";

import { ORPCError } from "@orpc/client";
import { AlertCircleIcon, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAppForm } from "@/components/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputGroupButton } from "@/components/ui/input-group";
import { isFieldInvalid } from "@/lib/utils";
import { SignInSchema } from "@/schemas/auth";
import { orpc } from "@/server/orpc";

const SignInForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const form = useAppForm({
    defaultValues: {
      username: "",
      password: "",
    },
    validators: {
      onChange: SignInSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = SignInSchema.parse(value);
        const data = await orpc.auth.signIn.call(payload);
        if (!data) return;

        router.push("/");
      } catch (error) {
        if (error instanceof ORPCError) {
          setErrorMessage(error.data.body.message);
        }
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="px-2 flex flex-col gap-y-8"
    >
      {errorMessage && (
        <Alert variant="destructive" className="bg-background">
          <AlertCircleIcon />
          <AlertTitle>Gagal Sign In</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      <FieldGroup>
        <form.AppField name="username">
          {(field) => (
            <Field>
              <FieldLabel>Username</FieldLabel>
              <field.TextField />
              {isFieldInvalid(field.state.meta) && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )}
        </form.AppField>

        <form.AppField name="password">
          {(field) => (
            <Field>
              <FieldLabel>Password</FieldLabel>
              <field.TextField
                type={showPassword ? "text" : "password"}
                addonRight={
                  <InputGroupButton
                    aria-label="Show Password"
                    size="icon-xs"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </InputGroupButton>
                }
              />
              {isFieldInvalid(field.state.meta) && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )}
        </form.AppField>
      </FieldGroup>

      <form.AppForm>
        <Field>
          <form.SubscribeButton label="Sign in" />
        </Field>
      </form.AppForm>
    </form>
  );
};

export default SignInForm;
