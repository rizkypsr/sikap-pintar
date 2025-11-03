"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { Loader2, AlertCircle } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  hasNextPage?: boolean
  isLoading?: boolean
  onLoadMore?: () => void
  onSearch?: (value: string) => void
  error?: string | null
  onRetry?: () => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  hasNextPage = false,
  isLoading = false,
  onLoadMore,
  onSearch,
  error,
  onRetry,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [searchValue, setSearchValue] = useState("")
  const loadMoreRef = useRef<HTMLTableRowElement>(null)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasNextPage || isLoading || !onLoadMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, isLoading, onLoadMore])

  return (
    <div className="w-full h-full flex flex-col">
      {searchKey && (
        <div className="flex items-center py-2 sm:py-4 flex-shrink-0">
          <Input
            placeholder={searchPlaceholder}
            value={onSearch ? searchValue : (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              if (onSearch) {
                setSearchValue(event.target.value)
                onSearch(event.target.value)
              } else {
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
            }}
            className="max-w-sm w-full sm:w-auto"
          />
        </div>
      )}
      
      {error && (
        <div className="flex items-center justify-center gap-4 p-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Coba Lagi
              </Button>
            )}
          </div>
        </div>
      )}
      
      <div className="rounded-md border flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              <>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {/* Load more trigger */}
                {hasNextPage && (
                  <TableRow ref={loadMoreRef}>
                    <TableCell colSpan={columns.length} className="h-16 text-center">
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Memuat data...
                        </div>
                      ) : (
                        <div className="text-muted-foreground">
                          Scroll untuk memuat lebih banyak
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </>
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  )
}