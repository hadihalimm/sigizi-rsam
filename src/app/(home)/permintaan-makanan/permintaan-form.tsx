import { useSuspenseQuery } from "@tanstack/react-query";
import { CircleAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAppForm } from "@/components/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAppDialog } from "@/hooks/use-dialog";
import { dailyPermintaanMakananQuery } from "@/query/daily-permintaan-makanan";
import { pasienQuery } from "@/query/pasien";
import { DailyPermintaanMakananCreateSchema } from "@/schemas/daily-permintaan-makanan";
import { PasienCreateSchema } from "@/schemas/pasien";
import { orpc } from "@/server/orpc";
import { DailyPermintaanMakananDetail } from "@/types/db";

interface PermintaanMakananFormProps {
  initialData?: DailyPermintaanMakananDetail;
  todayDate: Date;
}

const PermintaanMakananForm = ({
  initialData,
  todayDate,
}: PermintaanMakananFormProps) => {
  const dialog = useAppDialog(
    initialData ? "updatePermintaanMakanan" : "createPermintaanMakanan"
  );
  const createPermintaanMakanan = dailyPermintaanMakananQuery.useCreate();
  const updatePermintaanMakanan = dailyPermintaanMakananQuery.useUpdate();
  const createPasien = pasienQuery.useCreate();

  const permintaanForm = useAppForm({
    defaultValues: {
      day: initialData?.dailyPermintaanMakanan.day ?? todayDate,
      pasienId: initialData?.pasien.id ?? 0,
      ruanganId: initialData?.ruangan.id ?? "",
      makananTypeId: initialData?.makananType.id ?? "",
      dietIds:
        initialData?.dailyPermintaanMakananDietList.map((diet) => diet.id) ??
        [],
      note: initialData?.dailyPermintaanMakanan.note ?? "",
      isTerlambat: initialData?.dailyPermintaanMakanan.isTerlambat ?? false,
    },
    validators: {
      onChange: DailyPermintaanMakananCreateSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (initialData) {
          await updatePermintaanMakanan.mutateAsync({
            params: { id: initialData.dailyPermintaanMakanan.id },
            body: DailyPermintaanMakananCreateSchema.parse(value),
          });
          toast.success("Permintaan makanan berhasil di-update");
        } else {
          if (isPasienNotRegistered) {
            if (!pasienForm.state.isValid) return;
            const pasienValue = PasienCreateSchema.parse(
              pasienForm.state.values
            );
            const newPasien = await createPasien.mutateAsync(pasienValue);
            permintaanForm.setFieldValue("pasienId", newPasien.pasien.id);
          }
          const permintaanValue = DailyPermintaanMakananCreateSchema.parse(
            permintaanForm.state.values
          );
          await createPermintaanMakanan.mutateAsync(permintaanValue);
          toast.success("Permintaan makanan berhasil ditambahkan");
        }

        dialog.close();
      } catch (error) {
        toast.error(String(error));
      }
    },
  });

  const [isPasienNotRegistered, setIsPasienNotRegistered] = useState(false);
  const pasienForm = useAppForm({
    defaultValues: {
      medicalRecordNumber: initialData?.pasien.medicalRecordNumber ?? "",
      name: initialData?.pasien.name ?? "",
      dateOfBirth: initialData?.pasien.dateOfBirth ?? new Date(),
      alergiIds: [] as number[],
    },
    validators: {
      onChange: PasienCreateSchema,
    },
  });

  const [bangsalId, setBangsalId] = useState(
    initialData ? initialData.ruangan.bangsalId : ""
  );

  const { data: bangsalList } = useSuspenseQuery(
    orpc.bangsal.getAll.queryOptions()
  );
  const { data: ruanganList } = useSuspenseQuery(
    orpc.ruangan.getAll.queryOptions({
      input: { bangsalId: Number(bangsalId) },
    })
  );
  const { data: makananTypeList } = useSuspenseQuery(
    orpc.makananType.getAll.queryOptions()
  );
  const { data: dietList } = useSuspenseQuery(orpc.diet.getAll.queryOptions());
  const { data: alergiList } = useSuspenseQuery(
    orpc.alergi.getAll.queryOptions()
  );

  const handleCheckMrn = async () => {
    const mrn = pasienForm.getFieldValue("medicalRecordNumber");
    const data = await orpc.pasien.findByMedicalRecordNumber.call({
      medicalRecordNumber: mrn,
    });
    if (!data) {
      setIsPasienNotRegistered(true);
      return;
    }
    setIsPasienNotRegistered(false);
    permintaanForm.setFieldValue("pasienId", data.id);
    pasienForm.setFieldValue("name", data.name);
    data.dateOfBirth &&
      pasienForm.setFieldValue("dateOfBirth", data.dateOfBirth);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        permintaanForm.handleSubmit();
      }}
      className="px-2 flex flex-col gap-y-8"
    >
      <FieldGroup>
        <permintaanForm.AppField name="day">
          {(field) => <field.DateField className="hidden" />}
        </permintaanForm.AppField>
        <permintaanForm.AppField name="pasienId">
          {(field) => (
            <Field className="hidden">
              <field.TextField valueType="number" />
            </Field>
          )}
        </permintaanForm.AppField>

        <pasienForm.AppField name="medicalRecordNumber">
          {(field) => (
            <Field>
              <FieldLabel>No. MR</FieldLabel>
              <div className="flex gap-2">
                <field.TextField disabled={!!initialData} />
                <Button type="button" onClick={() => handleCheckMrn()}>
                  Cek No. MR
                </Button>
              </div>
            </Field>
          )}
        </pasienForm.AppField>

        {isPasienNotRegistered && (
          <Alert className="bg-secondary/10 text-orange-500">
            <CircleAlert />
            <AlertTitle>Pasien belum terdaftar di SIGIZI</AlertTitle>
            <AlertDescription>
              Silahkan isi data pasien terlebih dahulu
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-4">
          <pasienForm.AppField name="name">
            {(field) => (
              <Field className="w-2/3">
                <FieldLabel>Nama pasien</FieldLabel>
                <field.TextField
                  disabled={!!initialData || !isPasienNotRegistered}
                />
              </Field>
            )}
          </pasienForm.AppField>
          <pasienForm.AppField name="dateOfBirth">
            {(field) => (
              <Field className="w-1/3">
                <FieldLabel>Tanggal lahir</FieldLabel>
                <field.DateField
                  disabled={!!initialData || !isPasienNotRegistered}
                />
              </Field>
            )}
          </pasienForm.AppField>
        </div>

        {isPasienNotRegistered && (
          <pasienForm.AppField name="alergiIds">
            {(field) => (
              <Field>
                <FieldLabel>Alergi pasien</FieldLabel>
                <field.MultiSelectField
                  valueType="number"
                  options={alergiList.map((alergi) => ({
                    label: alergi.code,
                    value: alergi.id.toString(),
                  }))}
                  placeholder="Pilih alergi pasien (jika ada)..."
                />
              </Field>
            )}
          </pasienForm.AppField>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Bangsal</FieldLabel>
            <Select
              value={bangsalId.toString()}
              onValueChange={(value) => {
                setBangsalId(Number(value));
                permintaanForm.setFieldValue("ruanganId", "");
              }}
            >
              <SelectTrigger className="!h-auto w-full whitespace-normal break-words text-start">
                <SelectValue placeholder="Pilih bangsal..." />
              </SelectTrigger>
              <SelectContent>
                {bangsalList.map((bangsal) => (
                  <SelectItem key={bangsal.id} value={bangsal.id.toString()}>
                    {bangsal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <permintaanForm.AppField name="ruanganId">
            {(field) => (
              <Field>
                <FieldLabel>Ruangan</FieldLabel>
                <field.SelectField
                  valueType="number"
                  options={ruanganList.map((ruangan) => ({
                    label: ruangan.name,
                    value: ruangan.id.toString(),
                  }))}
                  placeholder="Pilih ruangan..."
                />
              </Field>
            )}
          </permintaanForm.AppField>
        </div>

        <permintaanForm.AppField name="makananTypeId">
          {(field) => (
            <Field>
              <FieldLabel>Jenis makanan</FieldLabel>
              <field.SelectField
                valueType="number"
                options={makananTypeList.map((mt) => ({
                  label: mt.code,
                  value: mt.id.toString(),
                }))}
                placeholder="Pilih jenis makanan..."
              />
            </Field>
          )}
        </permintaanForm.AppField>

        <permintaanForm.AppField name="dietIds">
          {(field) => (
            <Field>
              <FieldLabel>Diet</FieldLabel>
              <field.MultiSelectField
                valueType="number"
                options={dietList.map((diet) => ({
                  label: diet.code,
                  value: diet.id.toString(),
                }))}
                placeholder="Pilih diet..."
              />
            </Field>
          )}
        </permintaanForm.AppField>

        <permintaanForm.AppField name="isTerlambat">
          {(field) => (
            <Field orientation="horizontal" className="w-fit gap-8">
              <FieldLabel>Pasien telat?</FieldLabel>
              <Switch
                checked={field.state.value}
                onCheckedChange={(value) => field.handleChange(value)}
              />
            </Field>
          )}
        </permintaanForm.AppField>

        <permintaanForm.AppField name="note">
          {(field) => (
            <Field>
              <FieldLabel>Catatan</FieldLabel>
              <field.TextField />
            </Field>
          )}
        </permintaanForm.AppField>
      </FieldGroup>

      <permintaanForm.AppForm>
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
          <permintaanForm.SubscribeButton label="Submit" />
        </Field>
      </permintaanForm.AppForm>
    </form>
  );
};

export default PermintaanMakananForm;
