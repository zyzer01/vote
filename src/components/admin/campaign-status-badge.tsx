import { Badge } from "@/components/ui/badge"
import type { CampaignStatus, VotingMode } from "@/lib/api/types"

const STATUS_MAP: Record<
  CampaignStatus,
  { label: string; variant: React.ComponentProps<typeof Badge>["variant"]; dot: string }
> = {
  DRAFT: { label: "Draft", variant: "secondary", dot: "bg-muted-foreground" },
  PUBLISHED: { label: "Live", variant: "live", dot: "bg-brand-red" },
  PAUSED: { label: "Paused", variant: "warning", dot: "bg-brand-yellow" },
  CLOSED: { label: "Closed", variant: "outline", dot: "bg-muted-foreground" },
  ARCHIVED: { label: "Archived", variant: "outline", dot: "bg-muted-foreground" },
}

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const config = STATUS_MAP[status]
  return (
    <Badge variant={config.variant} className="gap-1.5">
      <span
        className={`size-1.5 rounded-full ${config.dot} ${
          status === "PUBLISHED" ? "animate-pulse" : ""
        }`}
      />
      {config.label}
    </Badge>
  )
}

const MODE_LABEL: Record<VotingMode, string> = {
  FREE: "Free",
  PAID: "Paid",
  HYBRID: "Free + Paid",
}

export function VotingModeBadge({ mode }: { mode: VotingMode }) {
  return <Badge variant="outline">{MODE_LABEL[mode]}</Badge>
}
