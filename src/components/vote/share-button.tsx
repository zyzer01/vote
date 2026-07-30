import { useState } from "react"
import { Check, Link2, Share2 } from "lucide-react"
import { toast } from "sonner"

import { shareLink } from "@/lib/share"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * Shares a link via the OS share sheet, falling back to a clipboard copy.
 * Used wherever a nominee's page can be passed on -their own page, their card
 * on the ballot, and the confirmation after a vote is counted.
 */
export function ShareButton({
  url,
  title,
  text,
  label = "Share",
  copiedLabel = "Link copied",
  variant = "outline",
  size = "lg",
  className,
}: {
  url: string
  title?: string
  text?: string
  label?: string
  copiedLabel?: string
  variant?: React.ComponentProps<typeof Button>["variant"]
  size?: React.ComponentProps<typeof Button>["size"]
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const result = await shareLink({ url, title, text })

    if (result === "copied") {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success(copiedLabel, { description: url })
    } else if (result === "failed") {
      toast.error("Couldn't share that link", { description: url })
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleShare}
      className={cn("font-semibold", className)}
    >
      {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
      {copied ? copiedLabel : label}
    </Button>
  )
}

/** Icon-only variant for tight spots like the nominee cards on a ballot. */
export function ShareIconButton({
  url,
  title,
  text,
  className,
  "aria-label": ariaLabel = "Share this nominee",
}: {
  url: string
  title?: string
  text?: string
  className?: string
  "aria-label"?: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleShare(event: React.MouseEvent) {
    // The card itself links to the nominee page; sharing shouldn't navigate.
    event.preventDefault()
    event.stopPropagation()

    const result = await shareLink({ url, title, text })

    if (result === "copied") {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("Link copied", { description: url })
    } else if (result === "failed") {
      toast.error("Couldn't share that link", { description: url })
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={ariaLabel}
      className={cn(
        "grid size-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none sm:size-8",
        className,
      )}
    >
      {copied ? (
        <Check className="size-4.5 sm:size-4" />
      ) : (
        <Link2 className="size-4.5 sm:size-4" />
      )}
    </button>
  )
}
