/**
 * Public voting API -every call maps to a route on `VotingPublicController`.
 * Voting routes live under `/v1`.
 */
import { apiRequest } from "./client"
import type {
  CampaignLanding,
  CampaignResults,
  CastVotePayload,
  CategoryBallot,
  ConfirmVoteResponse,
  FreeVoteAllowance,
  FreeVoteResponse,
  TrackViewPayload,
  VoteOrderResponse,
} from "./types"

const V1 = "/v1/voting/public"

export function getCampaignBySlug(voteOrgCode: string, campaignSlug: string) {
  return apiRequest<CampaignLanding>(
    `${V1}/vote-organizations/${encodeURIComponent(voteOrgCode)}/campaigns/${encodeURIComponent(campaignSlug)}`,
  )
}

export function getCategoryBallot(categoryId: string) {
  return apiRequest<CategoryBallot>(`${V1}/categories/${categoryId}`)
}

export function getFreeVoteAllowance(categoryId: string) {
  return apiRequest<FreeVoteAllowance>(
    `${V1}/categories/${categoryId}/free-vote-allowance`,
  )
}

export function getResults(campaignId: string) {
  return apiRequest<CampaignResults>(`${V1}/campaigns/${campaignId}/results`)
}

export function trackPageView(campaignId: string, payload: TrackViewPayload) {
  return apiRequest<{ tracked: boolean; visitorId: string }>(
    `${V1}/campaigns/${campaignId}/view`,
    { method: "POST", body: payload },
  )
}

export function createVoteOrder(campaignId: string, payload: CastVotePayload) {
  return apiRequest<VoteOrderResponse>(
    `${V1}/campaigns/${campaignId}/vote-orders`,
    { method: "POST", body: payload },
  )
}

export function castFreeVote(campaignId: string, payload: CastVotePayload) {
  return apiRequest<FreeVoteResponse>(
    `${V1}/campaigns/${campaignId}/free-votes`,
    { method: "POST", body: payload },
  )
}

export function confirmVoteOrder(reference: string) {
  return apiRequest<ConfirmVoteResponse>(`${V1}/vote-orders/confirm`, {
    method: "POST",
    body: { reference },
  })
}
