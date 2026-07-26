import { queryOptions } from "@tanstack/react-query"

import { queryKeys } from "../query"
import {
  getCampaignBySlug,
  getCategoryBallot,
  getFreeVoteAllowance,
  getResults,
} from "./voting"

export const campaignQuery = (organizationCode: string, campaignSlug: string) =>
  queryOptions({
    queryKey: queryKeys.campaign(organizationCode, campaignSlug),
    queryFn: () => getCampaignBySlug(organizationCode, campaignSlug),
  })

export const ballotQuery = (categoryId: string) =>
  queryOptions({
    queryKey: queryKeys.ballot(categoryId),
    queryFn: () => getCategoryBallot(categoryId),
  })

export const allowanceQuery = (categoryId: string, enabled = true) =>
  queryOptions({
    queryKey: queryKeys.allowance(categoryId),
    queryFn: () => getFreeVoteAllowance(categoryId),
    enabled,
    staleTime: 0,
  })

export const resultsQuery = (campaignId: string) =>
  queryOptions({
    queryKey: queryKeys.results(campaignId),
    queryFn: () => getResults(campaignId),
    // Results move; keep them fresh-ish for the live leaderboard.
    staleTime: 10_000,
  })
