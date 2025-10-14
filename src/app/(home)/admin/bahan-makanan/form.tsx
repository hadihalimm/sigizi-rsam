"use client";

import { toast } from "sonner";

import { useAppForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useAppDialog } from "@/hooks/use-dialog";
import { isFieldInvalid } from "@/lib/utils";
import { bahanMakananQuery } from "@/query/bahan-makanan";
import { BahanMakananCreateSchema } from "@/schemas/bahan-makanan";
import { BahanMakanan } from "@/types/db";

interface BahanMakananFormProps {
  initialData?: BahanMakanan;
}

const BahanMakananForm = ({ initialData }: BahanMakananFormProps) => {
  const dialog = useAppDialog(
    initialData ? "updateBahanMakanan" : "createBahanMakanan"
  );
  const create = bahanMakananQuery.useCreate();
  const update = bahanMakananQuery.useUpdate();
  const form = useAppForm({
    defaultValues: {
      name: initialData?.name ?? "",
      category: initialData?.category ?? "",
      unit: initialData?.unit ?? "",
      standard: initialData?.standard.toString() ?? "",
    },
    validators: {
      onChange: BahanMakananCreateSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (initialData) {
          await update.mutateAsync({
            params: {
              id: initialData.id,
            },
            body: {
              name: value.name,
              category: value.category,
              unit: value.unit,
              standard: value.standard,
            },
          });
          toast.success("Bahan makanan berhasil diupdate");
        } else {
          await create.mutateAsync({
            name: value.name,
            category: value.category,
            unit: value.unit,
            standard: value.standard,
          });
          toast.success("Bahan makanan berhasil ditambahkan");
        }

        dialog.close();
      } catch (error) {
        toast.error(String(error));
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
      <FieldGroup>
        <form.AppField name="name">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Nama</FieldLabel>
              <field.TextField />
              {isFieldInvalid(field.state.meta) && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )}
        </form.AppField>

        <form.AppField name="category">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Kategori</FieldLabel>
              <field.SelectField
                options={[
                  { label: "Makanan kering", value: "kering" },
                  { label: "Makanan basah", value: "basah" },
                ]}
              />
              {isFieldInvalid(field.state.meta) && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )}
        </form.AppField>

        <form.AppField name="unit">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Satuan</FieldLabel>
              <field.TextField />
              {isFieldInvalid(field.state.meta) && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )}
        </form.AppField>

        <form.AppField name="standard">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Standar</FieldLabel>
              <field.TextField />
              {isFieldInvalid(field.state.meta) && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )}
        </form.AppField>
      </FieldGroup>

      <form.AppForm>
        <Field orientation="horizontal" className="justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              dialog.close();
            }}
          >
            Cancel
          </Button>
          <form.SubscribeButton label="Submit" />
        </Field>
      </form.AppForm>
    </form>
  );
};

export default BahanMakananForm;
