import { RowData, Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "./ui/pagination";

interface TablePaginationProps<TData extends RowData> {
  table: Table<TData>;
  maxPagesToShow?: number;
  sidePages?: number;
  className?: string;
}

export default function TablePagination<TData extends RowData>({
  table,
  maxPagesToShow = 2,
  sidePages = 1,
  className,
}: TablePaginationProps<TData>) {
  const { pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();

  const pageNumbers = getPageNumbers(
    pageIndex,
    pageCount,
    maxPagesToShow,
    sidePages
  );
  return (
    <Pagination className={cn("", className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              table.firstPage();
            }}
          >
            <ChevronsLeft />
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (table.getCanPreviousPage()) table.previousPage();
            }}
          >
            <ChevronLeft />
          </PaginationLink>
        </PaginationItem>
        {pageNumbers.map((page, idx) => (
          <PaginationItem key={idx}>
            {page === "..." ? (
              <span>'...'</span>
            ) : (
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  table.setPageIndex(page - 1);
                }}
                isActive={page === pageIndex + 1}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationLink
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (table.getCanNextPage()) table.nextPage();
          }}
        >
          <ChevronRight />
        </PaginationLink>
        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              table.lastPage();
            }}
          >
            <ChevronsRight />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function getPageNumbers(
  pageIndex: number,
  pageCount: number,
  maxPagesToShow: number,
  sidePages: number
): (number | "...")[] {
  const pages: (number | "...")[] = [];

  if (pageCount <= maxPagesToShow) {
    for (let i = 1; i <= pageCount; i++) pages.push(i);
  } else {
    const start = Math.max(2, pageIndex + 1 - sidePages);
    const end = Math.min(pageCount - 1, pageIndex + 1 + sidePages);

    pages.push(1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);

    if (end < pageCount - 1) pages.push("...");

    pages.push(pageCount);
  }

  return pages;
}
