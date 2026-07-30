import { useState } from "react"
import { Check, Share2 } from "lucide-react"
import { toast } from "sonner"

import { shareLink } from "@/lib/share"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * Shares a link via the OS share sheet, falling back to a clipboard copy.
 * Used wherever a nominee's page can be passed on -their own page and the
 * confirmation after a vote is counted.
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
