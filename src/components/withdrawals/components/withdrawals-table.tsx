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
import { DataTablePagination } from "@/components/shared/data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { createWithdrawalsTableColumns } from "./withdrawals-table-columns"
import { useWithdrawals } from "../hooks/use-withdrawals"
import { useWithdrawalsContext } from "../context/withdrawals-context"
import { useAuth } from "@/lib/auth"
import type { WithdrawalStatus } from "../interfaces/withdrawal"

export function WithdrawalsTable() {
  const { voteOrganizationId } = useAuth()
  const { setSelectedWithdrawal, setIsWithdrawalDetailsOpen } = useWithdrawalsContext()
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])

  const { data: withdrawalsData, isLoading, error } = useWithdrawals(voteOrganizationId || "")

  const withdrawals = withdrawalsData || []

  const handleViewDetails = (withdrawal: WithdrawalStatus) => {
    setSelectedWithdrawal(withdrawal)
    setIsWithdrawalDetailsOpen(true)
  }

  const columns = createWithdrawalsTableColumns({
    onViewDetails: handleViewDetails,
  })

  const table = useReactTable({
    data: withdrawals,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="rounded-md border">
          <div className="h-64 animate-pulse bg-gray-100 dark:bg-gray-800"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-600 dark:text-red-400">Failed to load withdrawals</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} />
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
            {table.getRowModel().rows?.length ? (
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No withdrawals found.
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
