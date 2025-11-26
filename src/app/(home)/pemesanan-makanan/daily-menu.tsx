"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import DatePicker from "@/components/ui/date-picker";
import { Field, FieldLabel } from "@/components/ui/field";
import { ItemGroup } from "@/components/ui/item";
import { orpc } from "@/server/orpc";
import { useDateStore } from "@/stores/use-date-store";

import DailyMenuItem from "./daily-menu-item";
import SelectMenuBookForm from "./select-menu-book-form";

const DailyMenu = () => {
  const { dates, setDate } = useDateStore();
  const pemesananDate = dates["pemesananDate"];

  const { data: dailyMenuList } = useSuspenseQuery(
    orpc.dailyMenu.getAll.queryOptions({
      input: { date: pemesananDate.toLocaleDateString("en-CA") },
    })
  );

  return (
    <section className="flex flex-col gap-6">
      <div className="flex gap-4 lg:w-1/3 items-end">
        <Field>
          <FieldLabel>Tanggal</FieldLabel>
          <DatePicker
            value={pemesananDate}
            onValueChange={(value) => setDate("pemesananDate", value!)}
          />
        </Field>
      </div>

      {dailyMenuList.length === 0 && <SelectMenuBookForm />}

      <ItemGroup className="flex lg:flex-row gap-4">
        {dailyMenuList.map((item) => (
          <DailyMenuItem key={item.dailyMenu.id} item={item} />
        ))}
      </ItemGroup>
    </section>
  );
};

export default DailyMenu;
