import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { formatNaira, formatDate } from "@/lib/format"
import { Banknote, Calendar, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { getTransactionTypeBadgeVariant } from "../utils/status-helpers"
import type { TransactionSummary } from "../interfaces/wallet"

export const transactionColumns: ColumnDef<TransactionSummary>[] = [
  {
    accessorKey: "type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      const isCredit = type === "CREDIT"

      return (
        <div className="flex items-center gap-x-2">
          {isCredit ? (
            <ArrowDownLeft className="h-4 w-4 text-green-600" />
          ) : (
            <ArrowUpRight className="h-4 w-4 text-red-600" />
          )}
          <Badge variant={getTransactionTypeBadgeVariant(type)} className="capitalize">
            {type.toLowerCase()}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number
      const type = row.original.type

      return (
        <div className="flex items-center gap-x-2">
          <Banknote className="text-muted-foreground h-4 w-4" />
          <span
            className={`font-medium ${
              type === "CREDIT" ? "text-green-600" : "text-red-600"
            }`}
          >
            {type === "CREDIT" ? "+" : "-"}
            {formatNaira(amount)}
          </span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const amount = row.getValue(id) as number
      return amount.toString().includes(value)
    },
  },
  {
    accessorKey: "balanceAfter",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Balance After" />,
    cell: ({ row }) => {
      const balance = row.getValue("balanceAfter") as number
      return <span className="font-medium">{formatNaira(balance)}</span>
    },
  },
  {
    accessorKey: "reference",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Reference" />,
    cell: ({ row }) => {
      const reference = row.getValue("reference") as string
      return (
        <div className="max-w-[180px] truncate font-mono text-sm" title={reference}>
          {reference}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const reference = row.getValue(id) as string
      return reference.toLowerCase().includes(value.toLowerCase())
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
    cell: ({ row }) => {
      const description = row.getValue("description") as string
      return <div className="max-w-[200px] truncate">{description || "-"}</div>
    },
    filterFn: (row, id, value) => {
      const description = row.getValue(id) as string
      return description?.toLowerCase().includes(value.toLowerCase()) || false
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant="secondary" className="capitalize">
          {status.toLowerCase()}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string
      return (
        <div className="flex items-center gap-x-2">
          <Calendar className="text-muted-foreground h-4 w-4" />
          <span>{formatDate(date)}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const date = row.getValue(id) as string
      return date.includes(value)
    },
  },
]
