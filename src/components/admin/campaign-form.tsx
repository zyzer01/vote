import { Info } from "lucide-react"

import type { CampaignPayload, ProcessingFeeHandling  } from "@/lib/api/admin-types"
import type {
  FreeVoteWindow,
  ResultsVisibility,
  VotingMode,
} from "@/lib/api/types"
import { cn } from "@/lib/utils"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ImageUploadField } from "@/components/admin/image-upload-field"
import { DateTimePicker } from "@/components/admin/date-time-picker"

export interface CampaignFormValues {
  name: string
  description: string
  coverImageUrl: string
  logoUrl: string
  brandColor: string
  opensAt: string
  closesAt: string
  votingMode: VotingMode
  pricePerVoteMajor: string
  currency: string
  minVotesPerOrder: string
  maxVotesPerOrder: string
  processingFeeHandling: ProcessingFeeHandling
  freeVotesPerVoter: string
  freeVoteWindow: FreeVoteWindow
  resultsVisibility: ResultsVisibility
  requireAuthToVote: boolean
}

export const emptyCampaignForm: CampaignFormValues = {
  name: "",
  description: "",
  coverImageUrl: "",
  logoUrl: "",
  brandColor: "#0BA85B",
  opensAt: "",
  closesAt: "",
  votingMode: "PAID",
  pricePerVoteMajor: "100",
  currency: "NGN",
  minVotesPerOrder: "1",
  maxVotesPerOrder: "",
  processingFeeHandling: "PASS_TO_VOTER",
  freeVotesPerVoter: "1",
  freeVoteWindow: "ONCE",
  resultsVisibility: "LIVE",
  requireAuthToVote: false,
}

/** Convert an ISO string into the value a `datetime-local` input expects. */
export function toLocalInput(iso: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function buildCampaignPayload(v: CampaignFormValues): CampaignPayload {
  const isPaid = v.votingMode !== "FREE"
  const isFree = v.votingMode !== "PAID"
  const price = Math.round(Number(v.pricePerVoteMajor || "0") * 100)

  return {
    name: v.name.trim(),
    description: v.description.trim() || undefined,
    coverImageUrl: v.coverImageUrl.trim() || undefined,
    logoUrl: v.logoUrl.trim() || undefined,
    brandColor: v.brandColor.trim() || undefined,
    opensAt: new Date(v.opensAt).toISOString(),
    closesAt: new Date(v.closesAt).toISOString(),
    votingMode: v.votingMode,
    pricePerVoteMinor: isPaid ? price : 0,
    currency: v.currency.trim().toUpperCase() || "NGN",
    minVotesPerOrder: Number(v.minVotesPerOrder || "1"),
    maxVotesPerOrder: v.maxVotesPerOrder ? Number(v.maxVotesPerOrder) : null,
    processingFeeHandling: v.processingFeeHandling,
    freeVotesPerVoter: isFree ? Number(v.freeVotesPerVoter || "1") : null,
    freeVoteWindow: isFree ? v.freeVoteWindow : undefined,
    resultsVisibility: v.resultsVisibility,
    requireAuthToVote: v.requireAuthToVote,
  }
}

export function validateCampaignForm(
  v: CampaignFormValues,
): Record<string, string> {
  const errors: Record<string, string> = {}
  if (v.name.trim().length < 2) errors.name = "Give your campaign a name."
  if (!v.opensAt) errors.opensAt = "Set when voting opens."
  if (!v.closesAt) errors.closesAt = "Set when voting closes."
  if (v.opensAt && v.closesAt && new Date(v.closesAt) <= new Date(v.opensAt)) {
    errors.closesAt = "Closing time must be after the opening time."
  }
  if (v.votingMode !== "FREE") {
    const price = Number(v.pricePerVoteMajor)
    if (!Number.isFinite(price) || price <= 0) {
      errors.pricePerVoteMajor = "Set a price per vote."
    }
  }
  if (
    v.maxVotesPerOrder &&
    Number(v.maxVotesPerOrder) < Number(v.minVotesPerOrder || "1")
  ) {
    errors.maxVotesPerOrder = "Max can't be less than the minimum."
  }
  return errors
}

const VOTING_MODES: Array<{ value: VotingMode; label: string; hint: string }> = [
  { value: "PAID", label: "Paid votes", hint: "Voters pay per vote" },
  { value: "FREE", label: "Free votes", hint: "Everyone votes for free" },
  { value: "HYBRID", label: "Free + Paid", hint: "Free allowance, then paid" },
]

export function CampaignForm({
  values,
  errors,
  onChange,
  disabled,
  lockPricing,
}: {
  values: CampaignFormValues
  errors: Record<string, string>
  onChange: (patch: Partial<CampaignFormValues>) => void
  disabled?: boolean
  /** True once paid votes exist -money rules can no longer change. */
  lockPricing?: boolean
}) {
  const isPaid = values.votingMode !== "FREE"
  const isFree = values.votingMode !== "PAID"

  return (
    <div className="flex flex-col gap-8">
      <Section title="Basics" description="Name and brand your campaign page.">
        <Field label="Campaign name" htmlFor="name" required error={errors.name}>
          <Input
            id="name"
            value={values.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Sportly Awards 2026"
            disabled={disabled}
          />
        </Field>
        <Field
          label="Description"
          htmlFor="description"
          hint="Shown on the public campaign page."
        >
          <Textarea
            id="description"
            value={values.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Celebrating the best of the season…"
            disabled={disabled}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cover image" hint="Shown as the banner on your page.">
            <ImageUploadField
              value={values.coverImageUrl}
              onChange={(url) => onChange({ coverImageUrl: url })}
              folder="campaign-covers"
              aspect="video"
              disabled={disabled}
            />
          </Field>
          <Field label="Logo" hint="Square works best.">
            <ImageUploadField
              value={values.logoUrl}
              onChange={(url) => onChange({ logoUrl: url })}
              folder="campaign-logos"
              aspect="square"
              disabled={disabled}
            />
          </Field>
        </div>
        <Field label="Brand colour" hint="Used across your campaign page.">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={values.brandColor || "#0BA85B"}
              onChange={(e) => onChange({ brandColor: e.target.value })}
              disabled={disabled}
              className="border-input size-10 shrink-0 cursor-pointer rounded-lg border bg-transparent"
              aria-label="Brand colour"
            />
            <Input
              value={values.brandColor}
              onChange={(e) => onChange({ brandColor: e.target.value })}
              placeholder="#0BA85B"
              disabled={disabled}
              className="max-w-40 font-mono"
            />
          </div>
        </Field>
      </Section>

      <Section title="Schedule" description="When voting opens and closes.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Opens at"
            htmlFor="opensAt"
            required
            error={errors.opensAt}
          >
            <DateTimePicker
              id="opensAt"
              value={values.opensAt}
              onChange={(v) => onChange({ opensAt: v })}
              disabled={disabled}
              invalid={Boolean(errors.opensAt)}
            />
          </Field>
          <Field
            label="Closes at"
            htmlFor="closesAt"
            required
            error={errors.closesAt}
          >
            <DateTimePicker
              id="closesAt"
              value={values.closesAt}
              onChange={(v) => onChange({ closesAt: v })}
              disabled={disabled}
              invalid={Boolean(errors.closesAt)}
            />
          </Field>
        </div>
      </Section>

      <Section title="Voting & pricing" description="How votes are cast and priced.">
        {lockPricing ? (
          <div className="border-border bg-muted/50 text-muted-foreground flex items-start gap-2 rounded-lg border p-3 text-sm">
            <Info className="mt-0.5 size-4 shrink-0" />
            Pricing is locked because this campaign already has paid votes.
          </div>
        ) : null}

        <Field label="Voting mode">
          <div className="grid gap-3 sm:grid-cols-3">
            {VOTING_MODES.map((mode) => (
              <button
                key={mode.value}
                type="button"
                disabled={disabled || lockPricing}
                onClick={() => onChange({ votingMode: mode.value })}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all disabled:opacity-60",
                  values.votingMode === mode.value
                    ? "border-primary bg-primary/5 ring-primary/30 ring-1"
                    : "border-border hover:border-border/80 hover:bg-muted/50",
                )}
              >
                <span className="block text-sm font-semibold">{mode.label}</span>
                <span className="text-muted-foreground mt-0.5 block text-xs">
                  {mode.hint}
                </span>
              </button>
            ))}
          </div>
        </Field>

        {isPaid ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={`Price per vote (${values.currency})`}
              htmlFor="price"
              required
              error={errors.pricePerVoteMajor}
            >
              <Input
                id="price"
                type="number"
                min="0"
                step="1"
                value={values.pricePerVoteMajor}
                onChange={(e) =>
                  onChange({ pricePerVoteMajor: e.target.value })
                }
                disabled={disabled || lockPricing}
              />
            </Field>
            <Field label="Currency" htmlFor="currency">
              <Select
                value={values.currency}
                onValueChange={(v) => onChange({ currency: v as string })}
                disabled={disabled}
              >
                <SelectTrigger id="currency">
                  {values.currency}
                </SelectTrigger>
                <SelectContent>
                  {["NGN", "GHS", "KES", "ZAR", "USD"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Min votes per order" htmlFor="minVotes">
              <Input
                id="minVotes"
                type="number"
                min="1"
                value={values.minVotesPerOrder}
                onChange={(e) =>
                  onChange({ minVotesPerOrder: e.target.value })
                }
                disabled={disabled}
              />
            </Field>
            <Field
              label="Max votes per order"
              htmlFor="maxVotes"
              hint="Leave blank for unlimited."
              error={errors.maxVotesPerOrder}
            >
              <Input
                id="maxVotes"
                type="number"
                min="1"
                value={values.maxVotesPerOrder}
                onChange={(e) =>
                  onChange({ maxVotesPerOrder: e.target.value })
                }
                placeholder="Unlimited"
                disabled={disabled}
              />
            </Field>
            <Field label="Processing fee" className="sm:col-span-2">
              <Select
                value={values.processingFeeHandling}
                onValueChange={(v) =>
                  onChange({ processingFeeHandling: v as ProcessingFeeHandling })
                }
                disabled={disabled || lockPricing}
              >
                <SelectTrigger>
                  {values.processingFeeHandling === "PASS_TO_VOTER"
                    ? "Voter pays the processing fee"
                    : "Organization covers the processing fee"}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PASS_TO_VOTER">
                    Voter pays the processing fee
                  </SelectItem>
                  <SelectItem value="ORGANIZATION_COVERS">
                    Organization covers the processing fee
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        ) : null}

        {isFree ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Free votes per voter"
              htmlFor="freeVotes"
              hint="Per category."
            >
              <Input
                id="freeVotes"
                type="number"
                min="1"
                value={values.freeVotesPerVoter}
                onChange={(e) =>
                  onChange({ freeVotesPerVoter: e.target.value })
                }
                disabled={disabled}
              />
            </Field>
            <Field label="Free vote resets" htmlFor="freeWindow">
              <Select
                value={values.freeVoteWindow}
                onValueChange={(v) =>
                  onChange({ freeVoteWindow: v as FreeVoteWindow })
                }
                disabled={disabled}
              >
                <SelectTrigger id="freeWindow">
                  {FREE_WINDOW_LABEL[values.freeVoteWindow]}
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.keys(FREE_WINDOW_LABEL) as FreeVoteWindow[]
                  ).map((w) => (
                    <SelectItem key={w} value={w}>
                      {FREE_WINDOW_LABEL[w]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        ) : null}
      </Section>

      <Section title="Results & access" description="Control visibility and gating.">
        <Field label="Results visibility" htmlFor="results">
          <Select
            value={values.resultsVisibility}
            onValueChange={(v) =>
              onChange({ resultsVisibility: v as ResultsVisibility })
            }
            disabled={disabled}
          >
            <SelectTrigger id="results">
              {RESULTS_LABEL[values.resultsVisibility]}
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(RESULTS_LABEL) as ResultsVisibility[]).map((r) => (
                <SelectItem key={r} value={r}>
                  {RESULTS_LABEL[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <div className="border-border flex items-center justify-between rounded-xl border p-4">
          <div className="pr-4">
            <Label className="text-sm">Require sign-in to vote</Label>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Voters must be authenticated before casting a vote.
            </p>
          </div>
          <Switch
            checked={values.requireAuthToVote}
            onCheckedChange={(checked: boolean) =>
              onChange({ requireAuthToVote: checked })
            }
            disabled={disabled}
          />
        </div>
      </Section>
    </div>
  )
}

const FREE_WINDOW_LABEL: Record<FreeVoteWindow, string> = {
  ONCE: "Once per campaign",
  DAILY: "Every day",
  HOURLY: "Every hour",
}

const RESULTS_LABEL: Record<ResultsVisibility, string> = {
  LIVE: "Live - visible to everyone",
  HIDDEN_UNTIL_CLOSE: "Hidden until voting closes",
  ADMIN_ONLY: "Admin only",
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[16rem_1fr]">
      <div>
        <h2 className="font-heading font-semibold">{title}</h2>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}
