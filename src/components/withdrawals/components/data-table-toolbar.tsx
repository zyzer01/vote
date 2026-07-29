import { type Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DataTableFacetedFilter } from "@/components/shared/data-table-faceted-filter"
import { Filter, X } from "lucide-react"
import type { WithdrawalStatus } from "../interfaces/withdrawal"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface DataTableToolbarProps {
  table: Table<WithdrawalStatus>
}

const withdrawalStatuses = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
]

export function DataTableToolbar({ table }: DataTableToolbarProps) {
  const isFiltered = table.getState().columnFilters.length > 0

  const activeFiltersCount = table.getState().columnFilters.length

  const Filters = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={isMobile ? "flex flex-col gap-2 p-2" : "flex items-center space-x-2"}>
      {table.getColumn("status") && (
        <DataTableFacetedFilter
          column={table.getColumn("status")}
          title="Status"
          options={withdrawalStatuses}
        />
      )}
    </div>
  )

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center gap-2 overflow-x-auto pb-1">
        {/* Mobile View: Show filter popover */}
        <div className="md:hidden">
          <Popover>
            <PopoverTrigger
              render={
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 rounded-sm px-1 font-normal"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              }
            />
            <PopoverContent className="w-[200px] p-0" align="end">
              <Filters isMobile />
              {isFiltered && (
                <div className="p-2 pt-0">
                  <Button
                    variant="ghost"
                    onClick={() => table.resetColumnFilters()}
                    className="h-8 w-full justify-center text-xs"
                  >
                    Reset filters
                    <X className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Desktop View: Show all filters */}
        <div className="hidden items-center space-x-2 md:flex">
          <Filters />
        </div>

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="hidden h-8 px-2 md:flex lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
