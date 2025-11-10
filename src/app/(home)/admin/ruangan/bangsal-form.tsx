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
import { bangsalQuery } from "@/query/ruangan";
import { BangsalCreateSchema } from "@/schemas/ruangan";
import { Bangsal } from "@/types/db";

interface BangsalFormProps {
  initialData?: Bangsal;
}

const BangsalForm = ({ initialData }: BangsalFormProps) => {
  const dialog = useAppDialog(initialData ? "updateBangsal" : "createBangsal");
  const create = bangsalQuery.useCreate();
  const update = bangsalQuery.useUpdate();

  const form = useAppForm({
    defaultValues: {
      code: initialData?.code ?? "",
      name: initialData?.name ?? "",
    },
    validators: {
      onChange: BangsalCreateSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = BangsalCreateSchema.parse(value);
        if (initialData) {
          await update.mutateAsync({
            params: { id: initialData.id },
            body: payload,
          });
          toast.success("Bangsal berhasil diupdate");
        } else {
          await create.mutateAsync(payload);
          toast.success("Bangsal berhasil ditambahkan");
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
        <form.AppField name="code">
          {(field) => (
            <Field>
              <FieldLabel>Kode</FieldLabel>
              <field.TextField />
              {isFieldInvalid(field.state.meta) && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )}
        </form.AppField>

        <form.AppField name="name">
          {(field) => (
            <Field>
              <FieldLabel>Nama</FieldLabel>
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

export default BangsalForm;
