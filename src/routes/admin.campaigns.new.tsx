import { useState } from "react"
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

import { createCampaign } from "@/lib/api/admin"
import { ApiError } from "@/lib/api/client"
import { adminKeys } from "@/lib/api/admin-queries"
import { useAuth } from "@/lib/auth"
import {
  CampaignForm,
  buildCampaignPayload,
  emptyCampaignForm,
  validateCampaignForm,
  type CampaignFormValues,
} from "@/components/admin/campaign-form"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export const Route = createFileRoute("/admin/campaigns/new")({
  head: () => ({ meta: [{ title: "New campaign -Sportly Vote" }] }),
  component: NewCampaignPage,
})

function NewCampaignPage() {
  const { organizationId } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [values, setValues] = useState<CampaignFormValues>(emptyCampaignForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const mutation = useMutation({
    mutationFn: () =>
      createCampaign(organizationId, buildCampaignPayload(values)),
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] })
      queryClient.setQueryData(adminKeys.campaign(campaign.id), campaign)
      toast.success("Campaign created", {
        description: "Add categories and nominees, then publish.",
      })
      navigate({
        to: "/admin/campaigns/$campaignId",
        params: { campaignId: campaign.id },
      })
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Couldn't create campaign",
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
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/admin"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium"
        >
          <ArrowLeft className="size-4" />
          Campaigns
        </Link>
        <h1 className="font-heading mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          New campaign
        </h1>
        <p className="text-muted-foreground mt-1">
          Set up your campaign. You can change everything before publishing.
        </p>
      </div>

      <CampaignForm
        values={values}
        errors={errors}
        onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
        disabled={mutation.isPending}
      />

      {/* Actions */}
      <div className="border-border bg-background/80 sticky bottom-0 mt-10 flex items-center justify-end gap-3 border-t py-4 backdrop-blur-lg">
        <Link to="/admin">
          <Button type="button" variant="outline" disabled={mutation.isPending}>
            Cancel
          </Button>
        </Link>
        <Button type="submit" className="font-semibold" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Spinner />
              Creating…
            </>
          ) : (
            "Create campaign"
          )}
        </Button>
      </div>
    </form>
  )
}
