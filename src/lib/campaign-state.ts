import type { PublicCampaign } from "./api/types"

export type VotingState = "upcoming" | "live" | "paused" | "closed" | "ended"

export interface CampaignState {
  state: VotingState
  /** Whether votes can be cast right now. */
  canVote: boolean
  label: string
  /** The date a countdown should tick toward, if any. */
  countdownTo: string | null
  countdownLabel: string | null
}

/**
 * Reduces a campaign's status + voting window to a single UI state. Mirrors the
 * server's `isOpen` rule (PUBLISHED and within the window) but adds the
 * upcoming/ended nuances the landing page needs.
 */
export function getCampaignState(
  campaign: Pick<PublicCampaign, "status" | "opensAt" | "closesAt" | "isOpen">,
): CampaignState {
  const now = Date.now()
  const opens = new Date(campaign.opensAt).getTime()
  const closes = new Date(campaign.closesAt).getTime()

  if (campaign.status === "PAUSED") {
    return {
      state: "paused",
      canVote: false,
      label: "Voting paused",
      countdownTo: null,
      countdownLabel: null,
    }
  }

  if (campaign.status === "CLOSED" || campaign.status === "ARCHIVED") {
    return {
      state: "closed",
      canVote: false,
      label: "Voting closed",
      countdownTo: null,
      countdownLabel: null,
    }
  }

  if (campaign.status === "PUBLISHED" && now < opens) {
    return {
      state: "upcoming",
      canVote: false,
      label: "Voting opens soon",
      countdownTo: campaign.opensAt,
      countdownLabel: "Opens in",
    }
  }

  if (campaign.status === "PUBLISHED" && now > closes) {
    return {
      state: "ended",
      canVote: false,
      label: "Voting has ended",
      countdownTo: null,
      countdownLabel: null,
    }
  }

  if (campaign.status === "PUBLISHED") {
    return {
      state: "live",
      canVote: true,
      label: "Voting is live",
      countdownTo: campaign.closesAt,
      countdownLabel: "Closes in",
    }
  }

  return {
    state: "closed",
    canVote: false,
    label: "Not available",
    countdownTo: null,
    countdownLabel: null,
  }
}

export function votingModeLabel(mode: PublicCampaign["votingMode"]): string {
  return mode === "FREE"
    ? "Free voting"
    : mode === "HYBRID"
      ? "Free & paid votes"
      : "Paid voting"
}
