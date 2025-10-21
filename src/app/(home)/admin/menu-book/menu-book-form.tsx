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
import { menuBookQuery } from "@/query/menu";
import { MenuBookCreateSchema } from "@/schemas/menu";
import { MenuBook } from "@/types/db";

interface MenuBookFormProps {
  initialData?: MenuBook;
}

const MenuBookForm = ({ initialData }: MenuBookFormProps) => {
  const dialog = useAppDialog(
    initialData ? "updateMenuBook" : "createMenuBook"
  );
  const create = menuBookQuery.useCreate();
  const update = menuBookQuery.useUpdate();

  const form = useAppForm({
    defaultValues: {
      name: initialData?.name ?? "",
    },
    validators: {
      onChange: MenuBookCreateSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = MenuBookCreateSchema.parse(value);
        if (initialData) {
          await update.mutateAsync({
            params: { id: initialData.id },
            body: { name: payload.name },
          });
          toast.success("Buku menu berhasil diupdate");
        } else {
          await create.mutateAsync({
            name: payload.name,
          });
          toast.success("Buku menu berhasil ditambahkan");
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

export default MenuBookForm;
