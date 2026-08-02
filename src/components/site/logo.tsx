import { cn } from "@/lib/utils"

export function Logo({
  className,
  showWordmark = true,
  wordmarkClassName,
}: {
  className?: string
  showWordmark?: boolean
  wordmarkClassName?: string
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src="/sportly-logo.png"
        alt="Sportly"
        width={599}
        height={201}
        className="h-9 w-auto shrink-0"
        draggable={false}
      />
      {showWordmark && (
        <div
          className={cn(
            "flex items-baseline gap-1 text-[1.35rem] leading-none font-bold tracking-tight",
            wordmarkClassName,
          )}
        >
          <span className="rounded-md bg-primary/12 px-1.5 py-0.5 text-[0.7rem] font-bold tracking-wide text-primary-foreground uppercase">
            Vote
          </span>
        </div>
      )}
    </div>
  )
}
