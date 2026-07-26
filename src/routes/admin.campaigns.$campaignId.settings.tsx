import { useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { toast } from "sonner"

import { updateCampaign } from "@/lib/api/admin"
import { ApiError } from "@/lib/api/client"
import { adminKeys, campaignDetailQuery } from "@/lib/api/admin-queries"
import type { AdminCampaignDetail } from "@/lib/api/admin-types"
import {
  CampaignForm,
  buildCampaignPayload,
  toLocalInput,
  validateCampaignForm,
  type CampaignFormValues,
} from "@/components/admin/campaign-form"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export const Route = createFileRoute("/admin/campaigns/$campaignId/settings")({
  component: SettingsPage,
})

function toFormValues(c: AdminCampaignDetail): CampaignFormValues {
  return {
    name: c.name,
    description: c.description ?? "",
    coverImageUrl: c.coverImageUrl ?? "",
    logoUrl: c.logoUrl ?? "",
    brandColor: c.brandColor ?? "#0BA85B",
    opensAt: toLocalInput(c.opensAt),
    closesAt: toLocalInput(c.closesAt),
    votingMode: c.votingMode,
    pricePerVoteMajor: String(c.pricePerVoteMinor / 100),
    currency: c.currency,
    minVotesPerOrder: String(c.minVotesPerOrder),
    maxVotesPerOrder: c.maxVotesPerOrder ? String(c.maxVotesPerOrder) : "",
    processingFeeHandling: c.processingFeeHandling,
    freeVotesPerVoter: c.freeVotesPerVoter ? String(c.freeVotesPerVoter) : "1",
    freeVoteWindow: c.freeVoteWindow ?? "ONCE",
    resultsVisibility: c.resultsVisibility,
    requireAuthToVote: c.requireAuthToVote,
  }
}

function SettingsPage() {
  const { campaignId } = Route.useParams()
  const queryClient = useQueryClient()
  const { data: campaign } = useSuspenseQuery(campaignDetailQuery(campaignId))

  const initial = useMemo(() => toFormValues(campaign), [campaign])
  const [values, setValues] = useState<CampaignFormValues>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const lockPricing = campaign._count.orders > 0
  const archived = campaign.status === "ARCHIVED"

  const mutation = useMutation({
    mutationFn: () => updateCampaign(campaignId, buildCampaignPayload(values)),
    onSuccess: (updated) => {
      queryClient.setQueryData(adminKeys.campaign(campaignId), updated)
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] })
      toast.success("Changes saved")
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Couldn't save changes",
      )
    },
  })

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const found = validateCampaignForm(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      toast.error("Please fix the highlighted fields.")
      return
    }
    mutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit}>
      {archived ? (
        <div className="border-border bg-muted/50 text-muted-foreground mb-6 rounded-xl border p-4 text-sm">
          This campaign is archived and can no longer be edited.
        </div>
      ) : null}

      <CampaignForm
        values={values}
        errors={errors}
        onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
        disabled={mutation.isPending || archived}
        lockPricing={lockPricing}
      />

      <div className="border-border bg-background/80 sticky bottom-0 mt-10 flex items-center justify-end gap-3 border-t py-4 backdrop-blur-lg">
        <Button
          type="button"
          variant="outline"
          onClick={() => setValues(initial)}
          disabled={mutation.isPending || archived}
        >
          Reset
        </Button>
        <Button
          type="submit"
          className="font-semibold"
          disabled={mutation.isPending || archived}
        >
          {mutation.isPending ? (
            <>
              <Spinner />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  )
}
