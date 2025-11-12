import { useSuspenseQuery } from "@tanstack/react-query";
import { CircleAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAppForm } from "@/components/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAppDialog } from "@/hooks/use-dialog";
import { isFieldInvalid } from "@/lib/utils";
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
      pendampingCount:
        initialData?.dailyPermintaanMakanan.pendampingCount ?? "",
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
          if (isPasienNotRegistered || isPasienNotInSimrs) {
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
  const [isPasienNotInSimrs, setIsPasienNotInSimrs] = useState(false);
  const [isPasienVip, setIsPasienVip] = useState(false);
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
      input: {},
    })
  );
  const { data: treatmentClassList } = useSuspenseQuery(
    orpc.treatmentClass.getAll.queryOptions()
  );
  const { data: makananTypeList } = useSuspenseQuery(
    orpc.makananType.getAll.queryOptions()
  );
  const { data: dietList } = useSuspenseQuery(orpc.diet.getAll.queryOptions());
  const { data: alergiList } = useSuspenseQuery(
    orpc.alergi.getAll.queryOptions()
  );

  const handleCheckMrn = async () => {
    try {
      setIsPasienNotRegistered(false);
      setIsPasienNotInSimrs(false);
      const mrn = pasienForm.getFieldValue("medicalRecordNumber");
      const data = await orpc.pasien.findByMedicalRecordNumber.call({
        medicalRecordNumber: mrn,
      });
      if (!data) {
        const simrsData = await orpc.pasien.findFromSimrs.call({
          medicalRecordNumber: mrn,
        });
        if (!simrsData) {
          setIsPasienNotInSimrs(true);
          pasienForm.resetField("name");
          pasienForm.resetField("dateOfBirth");
          toast.error("Pasien tidak ditemukan di SIMRS", {
            description: "Silahkan masukkan No. MR yang benar",
          });
          return;
        }

        setIsPasienNotRegistered(true);
        pasienForm.setFieldValue("name", simrsData.nama);
        pasienForm.setFieldValue("dateOfBirth", new Date(simrsData.tgl_lahir));
        return;
      }
      permintaanForm.setFieldValue("pasienId", data.id);
      pasienForm.setFieldValue("name", data.name);
      if (data.dateOfBirth) {
        pasienForm.setFieldValue("dateOfBirth", data.dateOfBirth);
      }
    } catch (error) {
      toast.error(String(error));
    }
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
              {isFieldInvalid(field.state.meta) && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )}
        </pasienForm.AppField>

        {isPasienNotRegistered && (
          <Alert className="bg-secondary/10 text-orange-500">
            <CircleAlert />
            <AlertTitle>Alergi pasien belum diketahui</AlertTitle>
            <AlertDescription>
              Silahkan isi data alergi terlebih dahulu (jika ada)
            </AlertDescription>
          </Alert>
        )}

        {isPasienNotInSimrs && (
          <Alert className="bg-secondary/10 text-red-500">
            <CircleAlert />
            <AlertTitle>Pasien tidak ditemukan di SIMRS</AlertTitle>
            <AlertDescription>
              Data pasien tidak akan diisi secara otomatis. Pastikan Anda
              mengisi data dengan benar.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-4">
          <pasienForm.AppField name="name">
            {(field) => (
              <Field className="w-2/3">
                <FieldLabel>Nama pasien</FieldLabel>
                <field.TextField
                  disabled={
                    !!initialData ||
                    (!isPasienNotRegistered && !isPasienNotInSimrs)
                  }
                />
              </Field>
            )}
          </pasienForm.AppField>
          <pasienForm.AppField name="dateOfBirth">
            {(field) => (
              <Field className="w-1/3">
                <FieldLabel>Tanggal lahir</FieldLabel>
                <field.DateField
                  disabled={
                    !!initialData ||
                    (!isPasienNotRegistered && !isPasienNotInSimrs)
                  }
                />
              </Field>
            )}
          </pasienForm.AppField>
        </div>

        {(isPasienNotRegistered || isPasienNotInSimrs) && (
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
                setIsPasienVip(false);
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
                  options={ruanganList
                    .filter((ruangan) => ruangan.bangsalId === bangsalId)
                    .map((ruangan) => ({
                      label: ruangan.name,
                      value: ruangan.id.toString(),
                    }))}
                  placeholder="Pilih ruangan..."
                  onValueChange={(value) => {
                    const ruangan = ruanganList.find(
                      (ruangan) => ruangan.id === Number(value)
                    );
                    const treatmentClass = treatmentClassList.find(
                      (tc) => tc.id === ruangan?.treatmentClassId
                    );
                    if (treatmentClass?.code.toLowerCase().includes("vip")) {
                      setIsPasienVip(true);
                    }
                  }}
                />
              </Field>
            )}
          </permintaanForm.AppField>
        </div>

        {isPasienVip && (
          <permintaanForm.AppField name="pendampingCount">
            {(field) => (
              <Field>
                <FieldLabel>Jumlah pendamping</FieldLabel>
                <field.TextField valueType="number" />
              </Field>
            )}
          </permintaanForm.AppField>
        )}

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
