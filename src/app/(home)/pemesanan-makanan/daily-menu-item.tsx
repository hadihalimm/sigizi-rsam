"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Check, Edit, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAppForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";
import { dailyMenuDetailQuery } from "@/query/daily-menu";
import { DailyMenuDetailSchema } from "@/schemas/daily-menu";
import { orpc } from "@/server/orpc";
import { DailyMenuDetail } from "@/types/db";

interface DailyMenuItemProps {
  item: DailyMenuDetail;
}

const DailyMenuItem = ({ item }: DailyMenuItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
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
  const { data: makananList } = useSuspenseQuery(
    orpc.makanan.getAll.queryOptions()
  );
  const { data: snackList } = useSuspenseQuery(
    orpc.snack.getAll.queryOptions()
  );

  const updateDailyMenuDetail = dailyMenuDetailQuery.useUpdateDailyMenuDetail();
  const form = useAppForm({
    defaultValues: {
      makananIds: initialData.makananList.map((item) => item.id),
      snackIds: initialData.snackList.map((item) => item.id),
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

        onClose();
      } catch (error) {
        toast.error(String(error));
      }
    },
  });
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
          <form.AppForm>
            <form.SubscribeButton variant="outline" size="icon-sm" label="">
              <Check />
            </form.SubscribeButton>
          </form.AppForm>
        </ItemActions>
      </form>
    </Item>
  );
};

export default DailyMenuItem;
