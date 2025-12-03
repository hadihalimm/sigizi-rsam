import { toast } from "sonner";

import { useAppForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useAppDialog } from "@/hooks/use-dialog";
import { stockBahanMakananHistoryQuery } from "@/query/gudang";
import { StockBahanMakananHistoryCreateSchema } from "@/schemas/gudang";

interface StockUpdateFormProps {
  initialData?: {
    bahan_makanan: {
      id: number;
      name: string;
      category: string;
      unit: string;
      standard: number;
    };
    stock_bahan_makanan: {
      id: number;
      bahanMakananId: number;
      quantity: number;
    };
  };
}

const StockUpdateForm = ({ initialData }: StockUpdateFormProps) => {
  const dialog = useAppDialog("createStockBahanMakananHistory");
  const updateStock = stockBahanMakananHistoryQuery.useCreate();
  const form = useAppForm({
    defaultValues: {
      bahanMakananId: initialData?.bahan_makanan.id,
      change: 0,
      type: "",
      note: "",
    },
    validators: {
      onChange: StockBahanMakananHistoryCreateSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = StockBahanMakananHistoryCreateSchema.parse(value);
        await updateStock.mutateAsync({
          ...payload,
        });

        toast.info("Stok bahan makanan berhasil di-update");
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
      <div className="flex flex-col">
        <p className="font-medium text-lg">{initialData?.bahan_makanan.name}</p>
        <p>
          Stok sekarang: {initialData?.stock_bahan_makanan.quantity}{" "}
          {initialData?.bahan_makanan.unit}
        </p>
      </div>
      <FieldGroup>
        <form.AppField name="type">
          {(field) => (
            <Field>
              <FieldLabel>Jenis Perubahan Stok</FieldLabel>
              <field.SelectField
                options={[
                  { label: "penambahan", value: "IN" },
                  { label: "pengurangan", value: "OUT" },
                ]}
                placeholder="Pilih jenis perubahan..."
              />
            </Field>
          )}
        </form.AppField>

        <form.AppField name="change">
          {(field) => (
            <Field>
              <FieldLabel>Jumlah</FieldLabel>
              <field.TextField valueType="number" />
            </Field>
          )}
        </form.AppField>

        <form.AppField name="note">
          {(field) => (
            <Field>
              <FieldLabel>Catatan (opsional)</FieldLabel>
              <field.TextField />
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

export default StockUpdateForm;
