import { useSuspenseQuery } from "@tanstack/react-query";
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
import { ruanganQuery } from "@/query/ruangan";
import { RuanganCreateSchema } from "@/schemas/ruangan";
import { orpc } from "@/server/orpc";
import { Ruangan } from "@/types/db";

interface RuanganFormProps {
  initialData?: Ruangan;
  bangsalId: number;
}

const RuanganForm = ({ initialData, bangsalId }: RuanganFormProps) => {
  const { data: treatmentClassList } = useSuspenseQuery(
    orpc.treatmentClass.getAll.queryOptions()
  );

  const dialog = useAppDialog(initialData ? "updateRuangan" : "createRuangan");
  const create = ruanganQuery.useCreate();
  const update = ruanganQuery.useUpdate();

  const form = useAppForm({
    defaultValues: {
      code: initialData?.code ?? "",
      name: initialData?.name ?? "",
      treatmentClassId: initialData?.treatmentClassId ?? "",
    },
    validators: {
      onChange: RuanganCreateSchema.omit({ bangsalId: true }),
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = RuanganCreateSchema.omit({ bangsalId: true }).parse(
          value
        );
        if (initialData) {
          await update.mutateAsync({
            params: { id: initialData.id },
            body: {
              ...payload,
              bangsalId: initialData.bangsalId,
            },
          });
          toast.success("Ruangan berhasil diupdate");
        } else {
          await create.mutateAsync({
            ...payload,
            bangsalId: bangsalId,
          });
          toast.success("Ruangan berhasil ditambahkan");
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

        <form.AppField name="treatmentClassId">
          {(field) => (
            <Field>
              <FieldLabel>Kelas rawatan</FieldLabel>
              <field.SelectField
                valueType="number"
                options={treatmentClassList.map((item) => ({
                  label: item.name,
                  value: item.id.toString(),
                }))}
              />
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

export default RuanganForm;
