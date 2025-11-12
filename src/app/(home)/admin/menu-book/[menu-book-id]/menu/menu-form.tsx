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
import { menuQuery } from "@/query/menu";
import { MenuCreateSchema } from "@/schemas/menu";
import { orpc } from "@/server/orpc";

type MenuDetail = {
  menu: {
    id: number;
    name: string;
    menuOrder: number;
    menuPeriod: string;
    menuBookId: number;
  };
  makananList: {
    id: number;
    name: string;
    makananTypeId: number;
  }[];
  snackList: {
    id: number;
    name: string;
  }[];
};

interface MenuFormProps {
  initialData?: MenuDetail;
  menuBookId: number;
}

const MenuForm = ({ initialData, menuBookId }: MenuFormProps) => {
  const dialog = useAppDialog(initialData ? "updateMenu" : "createMenu");
  const create = menuQuery.useCreate();
  const update = menuQuery.useUpdate();
  const { data: makananList } = useSuspenseQuery(
    orpc.makanan.getAll.queryOptions()
  );
  const { data: snackList } = useSuspenseQuery(
    orpc.snack.getAll.queryOptions()
  );

  const form = useAppForm({
    defaultValues: {
      name: initialData?.menu.name ?? "",
      menuOrder: initialData?.menu.menuOrder ?? "",
      menuPeriod: initialData?.menu.menuPeriod ?? "",
      makananIds: initialData?.makananList.map((makanan) => makanan.id) ?? [],
      snackIds: initialData?.snackList.map((snack) => snack.id) ?? [],
      menuBookId: initialData?.menu.menuBookId ?? menuBookId,
    },
    validators: {
      onChange: MenuCreateSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = MenuCreateSchema.parse(value);
        if (initialData) {
          await update.mutateAsync({
            params: { id: initialData.menu.id },
            body: payload,
          });
          toast.success("Menu berhasil diupdate");
        } else {
          await create.mutateAsync(payload);
          toast.success("Menu berhasil ditambahkan");
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

        <form.AppField name="menuOrder">
          {(field) => (
            <Field>
              <FieldLabel>Urutan</FieldLabel>
              <field.TextField valueType="number" />
              {isFieldInvalid(field.state.meta) && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )}
        </form.AppField>

        <form.AppField name="menuPeriod">
          {(field) => (
            <Field>
              <FieldLabel>Waktu</FieldLabel>
              <field.SelectField
                options={[
                  { label: "pagi", value: "pagi" },
                  { label: "siang", value: "siang" },
                  { label: "malam", value: "malam" },
                ]}
              />
            </Field>
          )}
        </form.AppField>

        <form.AppField name="makananIds">
          {(field) => (
            <Field>
              <FieldLabel>Daftar makanan</FieldLabel>
              <field.MultiSelectField
                valueType="number"
                options={makananList.map((makanan) => ({
                  label: makanan.makanan.name,
                  value: makanan.makanan.id.toString(),
                }))}
              />
            </Field>
          )}
        </form.AppField>

        <form.AppField name="snackIds">
          {(field) => (
            <Field>
              <FieldLabel>Daftar snack</FieldLabel>
              <field.MultiSelectField
                valueType="number"
                options={snackList.map((snack) => ({
                  label: snack.snack.name,
                  value: snack.snack.id.toString(),
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

export default MenuForm;
