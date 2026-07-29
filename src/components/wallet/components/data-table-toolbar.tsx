import { useState } from "react"
import { type Table } from "@tanstack/react-table"
import { format } from "date-fns"
import { CalendarIcon, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DataTableFacetedFilter } from "@/components/shared/data-table-faceted-filter"
import { DataTableViewOptions } from "./data-table-view-options"
import { cn } from "@/lib/utils"
import type { TransactionSummary } from "../interfaces/wallet"
import { Badge } from "@/components/ui/badge"

interface DataTableToolbarProps {
  table: Table<TransactionSummary>
  q?: string
  onSearch?: (value: string) => void
  fromDate?: string
  onFromDateChange?: (value: string | undefined) => void
  toDate?: string
  onToDateChange?: (value: string | undefined) => void
  onReset?: () => void
}

const transactionTypes = [
  { value: "CREDIT", label: "Credit" },
  { value: "DEBIT", label: "Debit" },
]

const transactionStatuses = [
  { value: "COMPLETED", label: "Completed" },
  { value: "PENDING", label: "Pending" },
  { value: "FAILED", label: "Failed" },
]

export function DataTableToolbar({
  table,
  q,
  onSearch,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  onReset,
}: DataTableToolbarProps) {
  const [fromDatePopOpen, setFromDatePopOpen] = useState(false)
  const [toDatePopOpen, setToDatePopOpen] = useState(false)
  const [mobileFromDatePopOpen, setMobileFromDatePopOpen] = useState(false)
  const [mobileToDatePopOpen, setMobileToDatePopOpen] = useState(false)
  const [mobileFilterPopOpen, setMobileFilterPopOpen] = useState(false)

  const isFiltered =
    table.getState().columnFilters.length > 0 || !!q || !!fromDate || !!toDate

  const activeFiltersCount =
    (fromDate ? 1 : 0) +
    (toDate ? 1 : 0) +
    (table.getState().columnFilters.length > 0
      ? table.getState().columnFilters.length
      : 0)

  // Parse YYYY-MM-DD in local time to avoid UTC drift.
  const parseDateString = (dateStr: string | undefined): Date | undefined => {
    if (!dateStr) return undefined
    const parts = dateStr.split("-")
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
    }
    return new Date(dateStr)
  }

  const fromDateValue = parseDateString(fromDate)
  const toDateValue = parseDateString(toDate)

  const formatDateForAPI = (date: Date | undefined): string | undefined => {
    if (!date) return undefined
    return format(date, "yyyy-MM-dd")
  }

  const Filters = ({ isMobile = false }: { isMobile?: boolean }) => {
    const fromOpen = isMobile ? mobileFromDatePopOpen : fromDatePopOpen
    const setFromOpen = isMobile ? setMobileFromDatePopOpen : setFromDatePopOpen
    const toOpen = isMobile ? mobileToDatePopOpen : toDatePopOpen
    const setToOpen = isMobile ? setMobileToDatePopOpen : setToDatePopOpen

    return (
      <div className={isMobile ? "flex flex-col gap-2 p-2" : "flex items-center space-x-2"}>
        <div className={isMobile ? "flex flex-col gap-2" : "flex gap-x-2"}>
          {table.getColumn("type") && (
            <DataTableFacetedFilter
              column={table.getColumn("type")}
              title="Type"
              options={transactionTypes}
            />
          )}
          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={transactionStatuses}
            />
          )}
        </div>
        <div className={isMobile ? "flex flex-col gap-2" : "flex gap-x-2"}>
          <Popover open={fromOpen} onOpenChange={setFromOpen}>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  className={cn(
                    "h-8 w-full min-w-[140px] max-w-[180px] justify-start text-left font-normal",
                    !fromDateValue && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {fromDateValue ? format(fromDateValue, "PPP") : "From date"}
                  </span>
                </Button>
              }
            />
            <PopoverContent
              className="w-auto p-0"
              align={isMobile ? "center" : "start"}
            >
              <Calendar
                mode="single"
                selected={fromDateValue}
                onSelect={(date) => {
                  onFromDateChange?.(formatDateForAPI(date))
                  setFromOpen(false)
                }}
                disabled={(date) => (toDateValue ? date > toDateValue : false)}
                defaultMonth={fromDateValue || new Date()}
              />
            </PopoverContent>
          </Popover>
          <Popover open={toOpen} onOpenChange={setToOpen}>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  className={cn(
                    "h-8 w-full min-w-[140px] max-w-[180px] justify-start text-left font-normal",
                    !toDateValue && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {toDateValue ? format(toDateValue, "PPP") : "To date"}
                  </span>
                </Button>
              }
            />
            <PopoverContent
              className="w-auto p-0"
              align={isMobile ? "center" : "start"}
            >
              <Calendar
                mode="single"
                selected={toDateValue}
                onSelect={(date) => {
                  onToDateChange?.(formatDateForAPI(date))
                  setToOpen(false)
                }}
                disabled={(date) => (fromDateValue ? date < fromDateValue : false)}
                defaultMonth={toDateValue || fromDateValue || new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center gap-2 overflow-x-auto pb-1">
        <div className="min-w-0 flex-1">
          <Input
            placeholder="Filter transactions..."
            value={q ?? ""}
            onChange={(event) => onSearch?.(event.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                onSearch?.(q ?? "")
              }
            }}
            className="h-8 w-full min-w-0 shadow-none ring-offset-0 md:w-[200px] lg:w-[250px]"
          />
        </div>

        {/* Mobile View: Show filter popover */}
        <div className="md:hidden">
          <Popover open={mobileFilterPopOpen} onOpenChange={setMobileFilterPopOpen}>
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
                    onClick={() => {
                      table.resetColumnFilters()
                      onReset?.()
                      setMobileFilterPopOpen(false)
                    }}
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
            onClick={() => {
              table.resetColumnFilters()
              onReset?.()
            }}
            className="hidden h-8 px-2 md:flex lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
