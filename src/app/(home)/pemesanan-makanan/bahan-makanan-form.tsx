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
import { dailyBahanMakananQuery } from "@/query/daily-bahan-makanan";
import { DailyBahanMakananUpdateSchema } from "@/schemas/daily-bahan-makanan";
import { orpc } from "@/server/orpc";

interface DailyBahanMakananFormProps {
  initialData?: {
    bahanMakanan: {
      id: number;
      name: string;
      category: string;
      unit: string;
      standard: number;
    };
    quantities: {
      treatmentClass: {
        id: number;
        code: string;
        name: string;
      };
      quantity: number | null;
    }[];
  };
  pemesananDate: string;
  category: string;
}

const DailyBahanMakananForm = ({
  initialData,
  pemesananDate,
  category,
}: DailyBahanMakananFormProps) => {
  const dialog = useAppDialog(`updateDailyBahanMakanan-${category}`);
  const { data: treatmentClassList } = useSuspenseQuery(
    orpc.treatmentClass.getAll.queryOptions()
  );

  const updateDailyBahanMakanan =
    dailyBahanMakananQuery.useUpdateDailyBahanMakanan(pemesananDate);

  const form = useAppForm({
    defaultValues: {
      dailyBahanMakanan: treatmentClassList.map((tc) => ({
        date: pemesananDate,
        bahanMakananId: initialData?.bahanMakanan.id ?? "",
        treatmentClassId: tc.id ?? "",
        quantity:
          initialData?.quantities.find((q) => q.treatmentClass.id === tc.id)
            ?.quantity ?? 0,
      })),
    },
    validators: {
      onChange: DailyBahanMakananUpdateSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = DailyBahanMakananUpdateSchema.parse(value);
        if (initialData) {
          await updateDailyBahanMakanan.mutateAsync({
            dailyBahanMakanan: payload.dailyBahanMakanan,
          });
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
        {form.state.values.dailyBahanMakanan.map((item, idx) => (
          <form.AppField name={`dailyBahanMakanan[${idx}].quantity`} key={idx}>
            {(field) => (
              <Field>
                <FieldLabel>
                  {
                    treatmentClassList.find(
                      (tc) => tc.id === item.treatmentClassId
                    )?.code
                  }
                </FieldLabel>
                <field.TextField valueType="number" />
                {isFieldInvalid(field.state.meta) && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            )}
          </form.AppField>
        ))}
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

export default DailyBahanMakananForm;
