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
import { makananQuery } from "@/query/makanan";
import { MakananCreateSchema } from "@/schemas/makanan";
import { orpc } from "@/server/orpc";

type MakananDetail = {
  makanan: {
    id: number;
    name: string;
    makananTypeId: number;
  };
  makananType: {
    id: number;
    code: string;
    name: string;
  };
  makananResepDetail: {
    quantity: number;
    id: number;
    name: string;
    category: string;
    unit: string;
    standard: number;
  }[];
};

interface MakananFormProps {
  initialData?: MakananDetail;
}

const MakananForm = ({ initialData }: MakananFormProps) => {
  const dialog = useAppDialog(initialData ? "updateMakanan" : "createMakanan");
  const create = makananQuery.useCreate();
  const update = makananQuery.useUpdate();
  const { data: bahanMakananList } = useSuspenseQuery(
    orpc.bahanMakanan.getAll.queryOptions()
  );
  const { data: makananTypeList } = useSuspenseQuery(
    orpc.makananType.getAll.queryOptions()
  );

  const form = useAppForm({
    defaultValues: {
      name: initialData?.makanan.name ?? "",
      makananTypeId: initialData?.makanan.makananTypeId.toString() ?? "",
      makananResepDetail: initialData?.makananResepDetail.map(
        (bahanMakanan) => ({
          bahanMakananId: bahanMakanan.id.toString(),
          quantity: bahanMakanan.quantity.toString(),
        })
      ) ?? [
        {
          bahanMakananId: "",
          quantity: "",
        },
      ],
    },
    validators: {
      onChange: MakananCreateSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (initialData) {
          await update.mutateAsync({
            params: {
              id: initialData.makanan.id,
            },
            body: {
              name: value.name,
              makananTypeId: value.makananTypeId,
              makananResepDetail: value.makananResepDetail,
            },
          });
          toast.success("Makanan berhasil diupdate");
        } else {
          await create.mutateAsync({
            name: value.name,
            makananTypeId: value.makananTypeId,
            makananResepDetail: value.makananResepDetail,
          });
          toast.success("Makanan berhasil ditambahkan");
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

        <form.AppField name="makananTypeId">
          {(field) => (
            <Field>
              <FieldLabel>Jenis makanan</FieldLabel>
              <field.SelectField
                options={makananTypeList.map((mt) => ({
                  label: mt.code,
                  value: mt.id.toString(),
                }))}
              />
            </Field>
          )}
        </form.AppField>

        <form.AppField name="makananResepDetail" mode="array">
          {(field) => {
            return (
              <>
                <Field>
                  <FieldLabel>Resep</FieldLabel>
                  {field.state.value.map((item, idx) => {
                    return (
                      <div key={idx} className="flex gap-x-2 items-center">
                        <form.AppField
                          name={`makananResepDetail[${idx}].bahanMakananId`}
                        >
                          {(subField) => {
                            return (
                              <subField.SelectSearchField
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
                          name={`makananResepDetail[${idx}].quantity`}
                        >
                          {(subField) => {
                            return (
                              <div className="flex gap-x-1 items-center">
                                <subField.TextField
                                  placeholder="Jumlah..."
                                  addonRight={
                                    <InputGroupText>
                                      {field.state.value[idx] &&
                                        bahanMakananList.find(
                                          (bahan) =>
                                            bahan.id.toString() ===
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
                    field.pushValue({ bahanMakananId: "", quantity: "" })
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

export default MakananForm;
