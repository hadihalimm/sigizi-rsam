import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

import {
  MultiSelectField,
  SelectField,
  SelectSearchField,
} from "./select-field";
import SubscribeButton from "./subscribe-button";
import TextField from "./text-field";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    TextField,
    SelectField,
    SelectSearchField,
    MultiSelectField,
  },
  formComponents: { SubscribeButton },
  fieldContext,
  formContext,
});
