import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Check, Settings2 } from "lucide-react"
import type { Table } from "@tanstack/react-table"
import type { TransactionSummary } from "../interfaces/wallet"

interface DataTableViewOptionsProps {
  table: Table<TransactionSummary>
}

/**
 * Column-visibility toggle. Rebuilt on vote's Base UI DropdownMenu, which has
 * no `DropdownMenuCheckboxItem` — a plain item with a check icon and
 * `closeOnClick={false}` gives the same multi-toggle behavior.
 */
export function DataTableViewOptions({ table }: DataTableViewOptionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
            <Settings2 className="mr-2 h-4 w-4" />
            View
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-[150px]">
        {table
          .getAllColumns()
          .filter(
            (column) => typeof column.accessorFn !== "undefined" && column.getCanHide(),
          )
          .map((column) => (
            <DropdownMenuItem
              key={column.id}
              closeOnClick={false}
              className="capitalize"
              onClick={() => column.toggleVisibility(!column.getIsVisible())}
            >
              <Check
                className={
                  column.getIsVisible() ? "mr-2 h-4 w-4" : "mr-2 h-4 w-4 opacity-0"
                }
              />
              {column.id}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
