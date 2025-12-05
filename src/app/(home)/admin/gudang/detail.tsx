import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
} from "@/components/ui/timeline";
import { orpc } from "@/server/orpc";

interface StockDetailProps {
  bahanMakananStockId: number;
}

const StockDetail = ({ bahanMakananStockId }: StockDetailProps) => {
  const [cursor, setCursor] = useState("");
  const { data: stockDetail } = useSuspenseQuery(
    orpc.stockBahanMakananHistory.getById.queryOptions({
      input: {
        bahanMakananId: bahanMakananStockId,
        cursor: cursor,
      },
    })
  );

  return (
    <div className="flex flex-col gap-8 items-center">
      <Timeline defaultValue={stockDetail.rows.length}>
        {stockDetail.rows.map((detail, idx) => (
          <TimelineItem
            key={detail.id}
            step={idx}
            className="sm:group-data-[orientation=vertical]/timeline:ms-32"
          >
            <TimelineHeader>
              <TimelineSeparator />
              <TimelineDate className="sm:group-data-[orientation=vertical]/timeline:-left-44 sm:group-data-[orientation=vertical]/timeline:top-[2px] sm:group-data-[orientation=vertical]/timeline:absolute sm:group-data-[orientation=vertical]/timeline:w-32 sm:group-data-[orientation=vertical]/timeline:text-right">
                {Intl.DateTimeFormat("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(detail.createdAt)}
              </TimelineDate>
              <TimelineIndicator />
            </TimelineHeader>
            <TimelineContent className="flex flex-col">
              <p>{detail.type}</p>
              <p>Jumlah: {detail.change}</p>
              {detail.note && <p>Catatan: {detail.note}</p>}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>

      <Button
        className="w-fit"
        onClick={() => setCursor(stockDetail.nextCursor ?? "")}
      >
        More...
      </Button>
    </div>
  );
};

export default StockDetail;
