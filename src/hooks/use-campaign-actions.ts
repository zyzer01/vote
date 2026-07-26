import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

import {
  closeCampaign,
  deleteCampaign,
  pauseCampaign,
  publishCampaign,
} from "@/lib/api/admin"
import { ApiError } from "@/lib/api/client"
import { adminKeys } from "@/lib/api/admin-queries"
import type { AdminCampaignDetail } from "@/lib/api/admin-types"

function message(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback
}

/** Publish / pause / close / delete lifecycle actions for a campaign. */
export function useCampaignActions(campaignId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const onSettled = () => {
    queryClient.invalidateQueries({ queryKey: adminKeys.campaign(campaignId) })
    queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] })
  }

  const applyDetail = (campaign: AdminCampaignDetail) => {
    queryClient.setQueryData(adminKeys.campaign(campaignId), campaign)
  }

  const publish = useMutation({
    mutationFn: () => publishCampaign(campaignId),
    onSuccess: (c) => {
      applyDetail(c)
      toast.success("Campaign published", {
        description: "Your public voting page is now live.",
      })
    },
    onError: (e) => toast.error(message(e, "Couldn't publish campaign")),
    onSettled,
  })

  const pause = useMutation({
    mutationFn: () => pauseCampaign(campaignId),
    onSuccess: (c) => {
      applyDetail(c)
      toast.success("Campaign paused")
    },
    onError: (e) => toast.error(message(e, "Couldn't pause campaign")),
    onSettled,
  })

  const close = useMutation({
    mutationFn: () => closeCampaign(campaignId),
    onSuccess: (c) => {
      applyDetail(c)
      toast.success("Campaign closed", { description: "Results are now frozen." })
    },
    onError: (e) => toast.error(message(e, "Couldn't close campaign")),
    onSettled,
  })

  const remove = useMutation({
    mutationFn: () => deleteCampaign(campaignId),
    onSuccess: () => {
      toast.success("Campaign deleted")
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] })
      navigate({ to: "/admin" })
    },
    onError: (e) => toast.error(message(e, "Couldn't delete campaign")),
  })

  return { publish, pause, close, remove }
}
