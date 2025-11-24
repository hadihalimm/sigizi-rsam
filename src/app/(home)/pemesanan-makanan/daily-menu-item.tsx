"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Check, Edit, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAppForm } from "@/components/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";
import { dailyBahanMakananQuery } from "@/query/daily-bahan-makanan";
import { dailyMenuDetailQuery } from "@/query/daily-menu";
import { DailyMenuDetailSchema } from "@/schemas/daily-menu";
import { orpc } from "@/server/orpc";
import { useDateStore } from "@/stores/use-date-store";

type DailyMenuDetail = {
  dailyMenu: {
    id: number;
    day: Date;
    menuId: number | null;
    createdAt: Date;
    updatedAt: Date;
  };
  menu: {
    id: number;
    name: string;
    menuOrder: number;
    menuPeriod: string;
    menuBookId: number;
  } | null;
  makananList: {
    id?: number | undefined;
    name?: string | undefined;
    makananTypeId?: number | undefined;
  }[];
  snackList: {
    id?: number | undefined;
    name?: string | undefined;
  }[];
};

interface DailyMenuItemProps {
  item: DailyMenuDetail;
}

const DailyMenuItem = ({ item }: DailyMenuItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  if (!item) return null;
  if (isEditing)
    return (
      <DailyMenuItemForm
        initialData={item}
        onClose={() => setIsEditing(false)}
      />
    );
  return (
    <Item
      key={item.dailyMenu.id}
      variant="outline"
      className="w-full items-start shadow-sm"
    >
      <ItemContent className="gap-4">
        <ItemTitle className="text-lg">{item.menu?.name}</ItemTitle>
        <div>
          <p>Daftar makanan</p>
          <ul className="list-disc ml-4">
            {item.makananList.map((makanan) => (
              <li key={makanan.id}>{makanan.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <p>Daftar snack</p>
          <ul className="list-disc ml-4">
            {item.snackList.map((snack) => (
              <li key={snack.id}>{snack.name}</li>
            ))}
          </ul>
        </div>
      </ItemContent>
      <ItemActions className="place-self-start">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => {
            setIsEditing(true);
          }}
        >
          <Edit />
        </Button>
      </ItemActions>
    </Item>
  );
};

interface DailyMenuItemFormProps {
  initialData: DailyMenuDetail;
  onClose: () => void;
}

const DailyMenuItemForm = ({
  initialData,
  onClose,
}: DailyMenuItemFormProps) => {
  const { dates } = useDateStore();
  const pemesananDate = dates["pemesananDate"];
  const generateDailyBahanMakanan = dailyBahanMakananQuery.useGenerateByDate(
    pemesananDate.toLocaleDateString("en-CA")
  );
  const { data: makananList } = useSuspenseQuery(
    orpc.makanan.getAll.queryOptions()
  );
  const { data: snackList } = useSuspenseQuery(
    orpc.snack.getAll.queryOptions()
  );

  const updateDailyMenuDetail = dailyMenuDetailQuery.useUpdateDailyMenuDetail();
  const form = useAppForm({
    defaultValues: {
      makananIds: initialData.makananList
        .filter((item) => item.id !== undefined)
        .map((item) => item?.id),
      snackIds: initialData.snackList
        .filter((item) => item.id !== undefined)
        .map((item) => item?.id),
    },
    validators: {
      onChange: DailyMenuDetailSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = DailyMenuDetailSchema.parse(value);
        await updateDailyMenuDetail.mutateAsync({
          params: { dailyMenuId: initialData.dailyMenu.id },
          body: payload,
        });
        await generateDailyBahanMakanan.mutateAsync({
          date: pemesananDate.toLocaleDateString("en-CA"),
        });
        onClose();
      } catch (error) {
        toast.error(String(error));
      }
    },
  });
  console.log(form.getFieldValue("snackIds"));
  return (
    <Item
      variant="outline"
      className="w-full items-start shadow-sm border-primary/50 border-2"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex w-full justify-between"
      >
        <ItemContent className="gap-4">
          <ItemTitle className="text-lg">{initialData.menu?.name}</ItemTitle>
          <div>
            <p>Daftar makanan</p>
            <form.AppField name="makananIds">
              {(field) => (
                <field.MultiSelectField
                  valueType="number"
                  options={makananList.map((makanan) => ({
                    label: makanan.makanan.name,
                    value: makanan.makanan.id.toString(),
                  }))}
                />
              )}
            </form.AppField>
          </div>
          <div>
            <p>Daftar snack</p>
            <form.AppField name="snackIds">
              {(field) => (
                <field.MultiSelectField
                  valueType="number"
                  options={snackList.map((snack) => ({
                    label: snack.snack.name,
                    value: snack.snack.id.toString(),
                  }))}
                />
              )}
            </form.AppField>
          </div>
        </ItemContent>
        <ItemActions className="place-self-start gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            className="hover:bg-secondary"
            onClick={() => onClose()}
          >
            <X />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon-sm">
                <Check />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                <AlertDialogDescription>
                  Mengubah daftar menu akan mengubah daftar pemesanan bahan
                  makanan
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => onClose()}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={() => form.handleSubmit()}>
                  Ya, saya yakin
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </ItemActions>
      </form>
    </Item>
  );
};

export default DailyMenuItem;
