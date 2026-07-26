import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const pad = (n: number) => String(n).padStart(2, "0")

/** Split a `datetime-local` string ("YYYY-MM-DDTHH:mm") into a date + time. */
function parseValue(value: string): { date: Date | undefined; time: string } {
  if (!value) return { date: undefined, time: "" }
  const [datePart, timePart = ""] = value.split("T")
  const [y, m, d] = datePart.split("-").map(Number)
  const date =
    y && m && d ? new Date(y, m - 1, d) : undefined
  return { date, time: timePart.slice(0, 5) }
}

/** Recombine a picked date and time back into the `datetime-local` string. */
function toValue(date: Date, time: string): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${time || "12:00"}`
}

/**
 * Date + time picker that speaks the same "YYYY-MM-DDTHH:mm" local string the
 * campaign form already stores, so it drops in for the old `datetime-local`
 * inputs without touching the payload/validation logic.
 */
export function DateTimePicker({
  id,
  value,
  onChange,
  disabled,
  invalid,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  invalid?: boolean
}) {
  const [open, setOpen] = useState(false)
  const { date, time } = parseValue(value)

  const handleDateSelect = (next: Date | undefined) => {
    if (!next) return
    onChange(toValue(next, time))
    setOpen(false)
  }

  const handleTimeChange = (nextTime: string) => {
    // Without a chosen day there's nothing to anchor the time to yet; the day
    // picker will pick it up once a date is selected.
    if (date) onChange(toValue(date, nextTime))
  }

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          disabled={disabled}
          aria-invalid={invalid}
          className={cn(
            "border-input bg-background flex h-11 flex-1 items-center gap-2 rounded-lg border px-3.5 text-left text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px]",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:ring-[3px]",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
        >
          <CalendarIcon className="text-muted-foreground size-4 shrink-0" />
          <span className={cn(!date && "text-muted-foreground")}>
            {date ? format(date, "MMM d, yyyy") : "Pick a date"}
          </span>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0">
          <Calendar
            mode="single"
            selected={date}
            defaultMonth={date}
            onSelect={handleDateSelect}
            autoFocus
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        aria-label="Time"
        value={time}
        onChange={(e) => handleTimeChange(e.target.value)}
        disabled={disabled || !date}
        aria-invalid={invalid}
        className="w-32 shrink-0"
      />
    </div>
  )
}
