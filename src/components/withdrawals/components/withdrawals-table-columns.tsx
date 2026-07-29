import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { formatNaira, formatDate } from "@/lib/format"
import { Banknote, Calendar, Eye } from "lucide-react"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { getWithdrawalStatusVariant, getWithdrawalStatusLabel } from "../utils/status-helpers"
import type { WithdrawalStatus } from "../interfaces/withdrawal"

interface WithdrawalsTableColumnsProps {
  onViewDetails?: (withdrawal: WithdrawalStatus) => void
}

export function createWithdrawalsTableColumns({
  onViewDetails,
}: WithdrawalsTableColumnsProps): ColumnDef<WithdrawalStatus>[] {
  return [
    {
      accessorKey: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="From wallet" />,
      cell: ({ row }) => {
        const amount = row.getValue("amount") as number

        return (
          <div className="flex items-center gap-x-2">
            <Banknote className="text-muted-foreground h-4 w-4" />
            <span className="font-medium">{formatNaira(amount)}</span>
          </div>
        )
      },
    },
    {
      id: "netTransferAmount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="You'll receive" />,
      cell: ({ row }) => {
        const net = row.original.netTransferAmount
        if (net == null) {
          return <span className="text-muted-foreground">—</span>
        }
        return (
          <span className="font-medium tabular-nums text-green-700 dark:text-green-400">
            {formatNaira(net)}
          </span>
        )
      },
    },
    {
      accessorKey: "bankAccount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Bank Account" />,
      cell: ({ row }) => {
        const bankAccount = row.original.bankAccount

        if (!bankAccount) {
          return <span className="text-muted-foreground">-</span>
        }

        return (
          <div>
            <div className="font-medium">{bankAccount.accountName}</div>
            <div className="text-muted-foreground text-sm">
              {bankAccount.accountNumber} • {bankAccount.bankName}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.getValue("status") as string

        return (
          <Badge variant={getWithdrawalStatusVariant(status)} className="capitalize">
            {getWithdrawalStatusLabel(status)}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Initiated" />,
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string

        return (
          <div className="flex items-center gap-x-2">
            <Calendar className="text-muted-foreground h-4 w-4" />
            <span>{formatDate(date)}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "processedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Processed" />,
      cell: ({ row }) => {
        const processedAt = row.getValue("processedAt") as string

        if (!processedAt) {
          return <span className="text-muted-foreground">-</span>
        }

        return (
          <div className="flex items-center gap-x-2">
            <Calendar className="text-muted-foreground h-4 w-4" />
            <span>{formatDate(processedAt)}</span>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const withdrawal = row.original

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails?.(withdrawal)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        )
      },
    },
  ]
}
