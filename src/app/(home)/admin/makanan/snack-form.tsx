import { useSuspenseQuery } from "@tanstack/react-query";
import { Plus, Trash } from "lucide-react";
import { toast } from "sonner";

import { useAppForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputGroupText } from "@/components/ui/input-group";
import { useAppDialog } from "@/hooks/use-dialog";
import { isFieldInvalid } from "@/lib/utils";
import { snackQuery } from "@/query/snack";
import { SnackCreateSchema } from "@/schemas/snack";
import { orpc } from "@/server/orpc";

type SnackDetail = {
  snack: {
    id: number;
    name: string;
  };
  makananTypeList: {
    id: number;
    code: string;
    name: string;
  }[];
  dietList: {
    id: number;
    code: string;
    name: string;
  }[];
  snackResepDetail: {
    quantity: number;
    id: number;
    name: string;
    category: string;
    unit: string;
    standard: number;
  }[];
};

interface SnackFormProps {
  initialData?: SnackDetail;
}

const SnackForm = ({ initialData }: SnackFormProps) => {
  const dialog = useAppDialog(initialData ? "updateSnack" : "createSnack");
  const create = snackQuery.useCreate();
  const update = snackQuery.useUpdate();
  const { data: bahanMakananList } = useSuspenseQuery(
    orpc.bahanMakanan.getAll.queryOptions()
  );
  const { data: makananTypeList } = useSuspenseQuery(
    orpc.makananType.getAll.queryOptions()
  );
  const { data: dietList } = useSuspenseQuery(orpc.diet.getAll.queryOptions());

  const form = useAppForm({
    defaultValues: {
      name: initialData?.snack.name ?? "",
      makananTypeIds: initialData?.makananTypeList.map((mt) => mt.id) ?? [],
      dietIds: initialData?.dietList.map((diet) => diet.id) ?? [],
      snackResepDetail: initialData?.snackResepDetail.map((bahanMakanan) => ({
        bahanMakananId: bahanMakanan.id,
        quantity: bahanMakanan.quantity,
      })) ?? [
        {
          bahanMakananId: "",
          quantity: "",
        },
      ],
    },
    validators: {
      onChange: SnackCreateSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (initialData) {
          await update.mutateAsync({
            params: {
              id: initialData.snack.id,
            },
            body: {
              name: value.name,
              makananTypeIds: value.makananTypeIds,
              dietIds: value.dietIds,
              snackResepDetail: value.snackResepDetail.map((detail) => ({
                bahanMakananId: Number(detail.bahanMakananId),
                quantity: Number(detail.quantity),
              })),
            },
          });
          toast.success("Snack berhasil diupdate");
        } else {
          await create.mutateAsync({
            name: value.name,
            makananTypeIds: value.makananTypeIds,
            dietIds: value.dietIds,
            snackResepDetail: value.snackResepDetail.map((detail) => ({
              bahanMakananId: Number(detail.bahanMakananId),
              quantity: Number(detail.quantity),
            })),
          });
          toast.success("Snack berhasil ditambahkan");
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
              <FieldLabel>Nama</FieldLabel>
              <field.TextField />
              {isFieldInvalid(field.state.meta) && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )}
        </form.AppField>

        <form.AppField name="makananTypeIds">
          {(field) => (
            <Field>
              <FieldLabel>Jenis makanan</FieldLabel>
              <field.MultiSelectField
                valueType="number"
                options={makananTypeList.map((mt) => ({
                  label: mt.code,
                  value: mt.id.toString(),
                }))}
              />
            </Field>
          )}
        </form.AppField>

        <form.AppField name="dietIds">
          {(field) => (
            <Field>
              <FieldLabel>Diet</FieldLabel>
              <field.MultiSelectField
                valueType="number"
                options={dietList.map((diet) => ({
                  label: diet.code,
                  value: diet.id.toString(),
                }))}
              />
            </Field>
          )}
        </form.AppField>

        <form.AppField name="snackResepDetail" mode="array">
          {(field) => {
            return (
              <>
                <Field>
                  <FieldLabel>Resep</FieldLabel>
                  {field.state.value.map((item, idx) => {
                    return (
                      <div key={idx} className="flex gap-x-2 items-center">
                        <form.AppField
                          name={`snackResepDetail[${idx}].bahanMakananId`}
                        >
                          {(subField) => {
                            return (
                              <subField.SelectSearchField
                                valueType="number"
                                options={bahanMakananList.map((bahan) => ({
                                  label: bahan.name,
                                  value: bahan.id.toString(),
                                }))}
                                className="w-1/2"
                                placeholder="Pilih bahan makanan..."
                              />
                            );
                          }}
                        </form.AppField>

                        <form.AppField
                          name={`snackResepDetail[${idx}].quantity`}
                        >
                          {(subField) => {
                            return (
                              <div className="flex gap-x-1 items-center">
                                <subField.TextField
                                  valueType="number"
                                  placeholder="Jumlah..."
                                  addonRight={
                                    <InputGroupText>
                                      {field.state.value[idx] &&
                                        bahanMakananList.find(
                                          (bahan) =>
                                            bahan.id ===
                                            field.state.value[idx]
                                              .bahanMakananId
                                        )?.unit}
                                    </InputGroupText>
                                  }
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon-sm"
                                  onClick={() => {
                                    field.removeValue(idx);
                                  }}
                                >
                                  <Trash />
                                </Button>
                              </div>
                            );
                          }}
                        </form.AppField>
                      </div>
                    );
                  })}
                </Field>
                <Button
                  type="button"
                  className="w-fit"
                  onClick={() =>
                    field.pushValue({
                      bahanMakananId: "",
                      quantity: "",
                    })
                  }
                >
                  <Plus />
                  Tambah bahan makanan
                </Button>
              </>
            );
          }}
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

export default SnackForm;
