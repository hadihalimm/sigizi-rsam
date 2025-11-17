import { useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAppForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { dailyMenuQuery } from "@/query/daily-menu";
import { orpc } from "@/server/orpc";

interface SelectMenuBookFormProps {
  date: Date;
}

const SelectMenuBookForm = ({ date }: SelectMenuBookFormProps) => {
  const { data: menuBookList } = useSuspenseQuery(
    orpc.menuBook.getAll.queryOptions()
  );
  const createManyByMenuBook = dailyMenuQuery.useCreateManyByMenuBook();
  const form = useAppForm({
    defaultValues: {
      menuBookId: "",
    },
    validators: {
      onChange({ value }) {
        if (!value.menuBookId) {
          return "Silahkan pilih buku menu";
        }
      },
    },
    onSubmit: async ({ value }) => {
      try {
        await createManyByMenuBook.mutateAsync({
          day: date.toLocaleDateString("en-CA"),
          menuBookId: Number(value.menuBookId),
        });
      } catch (error) {
        toast.error(String(error));
      }
    },
  });

  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyTitle>Belum ada pemesanan untuk tanggal ini.</EmptyTitle>
        <EmptyDescription>
          Silahkan inisialisasi pemesanan dengan memilih salah satu buku menu.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="px-2 flex gap-4 w-full justify-center"
        >
          <form.AppField name="menuBookId">
            {(field) => (
              <field.SelectField
                valueType="number"
                placeholder="Pilih buku menu..."
                options={menuBookList.map((mb) => ({
                  label: mb.name,
                  value: mb.id.toString(),
                }))}
                className="w-1/2"
              />
            )}
          </form.AppField>
          <form.AppForm>
            <form.SubscribeButton label="Submit" />
          </form.AppForm>
        </form>
      </EmptyContent>
    </Empty>
  );
};

export default SelectMenuBookForm;
