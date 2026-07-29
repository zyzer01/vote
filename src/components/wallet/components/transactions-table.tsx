import { useState } from "react"
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { DataTablePagination } from "@/components/shared/data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { transactionColumns } from "./transactions-table-columns"
import { useTransactions } from "../hooks/use-transactions"
import { useAuth } from "@/lib/auth"
import type { GetTransactionsParams } from "../interfaces/wallet"

interface TransactionsTableProps {
  searchParams?: Partial<GetTransactionsParams>
}

export function TransactionsTable({ searchParams }: TransactionsTableProps) {
  const { voteOrganizationId } = useAuth()

  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [fromDate, setFromDate] = useState<string | undefined>(searchParams?.fromDate)
  const [toDate, setToDate] = useState<string | undefined>(searchParams?.toDate)
  const [globalFilter, setGlobalFilter] = useState("")

  const sanitizeType = (value?: string): GetTransactionsParams["type"] => {
    if (value === "CREDIT" || value === "DEBIT") {
      return value
    }
    return undefined
  }

  const sanitizedParams: GetTransactionsParams = {
    type: sanitizeType(searchParams?.type),
    status: searchParams?.status,
    fromDate: fromDate,
    toDate: toDate,
    page: searchParams?.page,
    limit: searchParams?.limit,
  }

  const {
    data: transactionsData,
    isLoading,
    isError,
    error,
  } = useTransactions(voteOrganizationId || "", sanitizedParams)

  const transactions = transactionsData?.items || []
  const pageCount = transactionsData?.meta?.totalPages || 0
  const pageSize = sanitizedParams.limit || 10

  const table = useReactTable({
    data: transactions,
    columns: transactionColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue ?? "")
        .toLowerCase()
        .trim()
      if (!q) return true
      const r = row.original
      const reference = (r.reference ?? "").toLowerCase()
      const description = (r.description ?? "").toLowerCase()
      const type = (r.type ?? "").toLowerCase()
      const status = (r.status ?? "").toLowerCase()
      return (
        reference.includes(q) ||
        description.includes(q) ||
        type.includes(q) ||
        status.includes(q) ||
        String(r.amount ?? "").includes(q)
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    pageCount,
    manualPagination: true,
  })

  const handleReset = () => {
    setFromDate(undefined)
    setToDate(undefined)
    setGlobalFilter("")
    table.resetColumnFilters()
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        q={globalFilter}
        onSearch={setGlobalFilter}
        fromDate={fromDate}
        onFromDateChange={setFromDate}
        toDate={toDate}
        onToDateChange={setToDate}
        onReset={handleReset}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: transactionColumns.length }).map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-6 w-[100px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={transactionColumns.length} className="h-24">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {error instanceof Error ? error.message : "Failed to load transactions"}
                    </AlertDescription>
                  </Alert>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={transactionColumns.length}
                  className="h-24 text-center"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
