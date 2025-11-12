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
import { pasienQuery } from "@/query/pasien";
import { PasienCreateSchema } from "@/schemas/pasien";
import { orpc } from "@/server/orpc";

import { PasienDetail } from "./table";

interface PasienFormProps {
  initialData?: PasienDetail;
}

const PasienForm = ({ initialData }: PasienFormProps) => {
  const dialog = useAppDialog(initialData ? "updatePasien" : "createPasien");
  const create = pasienQuery.useCreate();
  const update = pasienQuery.useUpdate();

  const { data: alergiList } = useSuspenseQuery(
    orpc.alergi.getAll.queryOptions()
  );

  const form = useAppForm({
    defaultValues: {
      medicalRecordNumber: initialData?.pasien.medicalRecordNumber ?? "",
      name: initialData?.pasien.name ?? "",
      dateOfBirth: initialData?.pasien.dateOfBirth ?? "",
      alergiIds: initialData?.alergi.map((alergi) => alergi?.id) ?? [],
    },
    validators: {
      onChange: PasienCreateSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = PasienCreateSchema.parse(value);
        console.log(payload);
        if (initialData) {
          await update.mutateAsync({
            params: { id: initialData.pasien.id },
            body: payload,
          });
          toast.success("Pasien berhasil diupdate");
        } else {
          await create.mutateAsync(payload);
          toast.success("Pasien berhasil ditambahkan");
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
        <form.AppField name="medicalRecordNumber">
          {(field) => (
            <Field>
              <FieldLabel>No. MR</FieldLabel>
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

        <form.AppField name="dateOfBirth">
          {(field) => (
            <Field>
              <FieldLabel>Tanggal lahir</FieldLabel>
              <field.DateField placeholder="Pilih tanggal..." />
            </Field>
          )}
        </form.AppField>

        <form.AppField name="alergiIds">
          {(field) => (
            <Field>
              <FieldLabel>Alergi</FieldLabel>
              <field.MultiSelectField
                valueType="number"
                options={alergiList.map((alergi) => ({
                  label: alergi.code,
                  value: alergi.id.toString(),
                }))}
                placeholder="Pilih alergi (jika ada)..."
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

export default PasienForm;
