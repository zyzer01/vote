import type { Column } from "@tanstack/react-table"
import { Check, PlusCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
}

/**
 * A multi-select column filter. Rebuilt on vote's Base UI Popover (arena's
 * version used a Radix + `cmdk` Command palette, which vote doesn't ship) — the
 * option sets here are tiny (2–3 values), so a plain toggle list is enough.
 */
export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues()
  const selectedValues = new Set(column?.getFilterValue() as string[])

  const toggle = (value: string) => {
    if (selectedValues.has(value)) {
      selectedValues.delete(value)
    } else {
      selectedValues.add(value)
    }
    const filterValues = Array.from(selectedValues)
    column?.setFilterValue(filterValues.length ? filterValues : undefined)
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm" className="h-8 border-dashed">
            <PlusCircle className="mr-2 h-4 w-4" />
            {title}
            {selectedValues.size > 0 && (
              <>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                  {selectedValues.size}
                </Badge>
                <div className="hidden space-x-1 lg:flex">
                  {selectedValues.size > 2 ? (
                    <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                      {selectedValues.size} selected
                    </Badge>
                  ) : (
                    options
                      .filter((option) => selectedValues.has(option.value))
                      .map((option) => (
                        <Badge
                          variant="secondary"
                          key={option.value}
                          className="rounded-sm px-1 font-normal"
                        >
                          {option.label}
                        </Badge>
                      ))
                  )}
                </div>
              </>
            )}
          </Button>
        }
      />
      <PopoverContent className="w-[200px] p-1" align="start">
        <div className="flex flex-col">
          {options.map((option) => {
            const isSelected = selectedValues.has(option.value)
            return (
              <button
                type="button"
                key={option.value}
                onClick={() => toggle(option.value)}
                className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none select-none"
              >
                <div
                  className={cn(
                    "border-primary flex h-4 w-4 items-center justify-center rounded-sm border",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "opacity-50 [&_svg]:invisible",
                  )}
                >
                  <Check className="h-3 w-3" />
                </div>
                {option.icon && (
                  <option.icon className="text-muted-foreground mr-2 h-4 w-4" />
                )}
                <span>{option.label}</span>
                {facets?.get(option.value) && (
                  <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                    {facets.get(option.value)}
                  </span>
                )}
              </button>
            )
          })}
          {selectedValues.size > 0 && (
            <>
              <Separator className="my-1" />
              <button
                type="button"
                onClick={() => column?.setFilterValue(undefined)}
                className="hover:bg-accent hover:text-accent-foreground rounded-lg px-2.5 py-2 text-center text-sm outline-none select-none"
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
