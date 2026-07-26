import { useState } from "react"

import { cn } from "@/lib/utils"

/** Circular avatar with an initials fallback when no image (or it fails). */
function Avatar({
  src,
  name,
  className,
  ...props
}: React.ComponentProps<"div"> & { src?: string | null; name?: string }) {
  const [failed, setFailed] = useState(false)
  const showImage = src && !failed

  return (
    <div
      data-slot="avatar"
      className={cn(
        "bg-muted text-muted-foreground relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full font-medium select-none",
        className,
      )}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt={name ?? ""}
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <span aria-hidden className="text-[0.9em]">
          {initials(name)}
        </span>
      )}
    </div>
  )
}

function initials(name?: string): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")
}

export { Avatar }
