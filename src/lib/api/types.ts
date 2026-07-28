/**
 * Types mirroring the voting API payloads. These match the shapes returned by
 * the public voting service -kept hand-written (rather than generated) so the
 * app depends only on the public surface.
 */

export type CampaignStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "PAUSED"
  | "CLOSED"
  | "ARCHIVED"

export type VotingMode = "FREE" | "PAID" | "HYBRID"

export type ResultsVisibility = "LIVE" | "HIDDEN_UNTIL_CLOSE" | "ADMIN_ONLY"

export type FreeVoteWindow = "ONCE" | "DAILY" | "HOURLY"

export type PaymentProviderType = "paystack" | "stripe" | "flutterwave" | "tagpay"

/** Response of GET /config/payments/:app */
export interface PaymentGatewayConfig {
  enabled: PaymentProviderType[]
  default: PaymentProviderType
}

export type NomineeStatus = "ACTIVE" | "HIDDEN" | "DISQUALIFIED" | "WITHDRAWN"

export type NomineeSubjectType = "CUSTOM" | "PLAYER" | "TEAM" | "COACH" | "USER"

export interface OrganizationRef {
  id: string
  name: string
  code: string
}

/** Shared campaign fields exposed on public pages (see `toPublicCampaign`). */
export interface PublicCampaign {
  id: string
  name: string
  slug: string
  description: string | null
  coverImageUrl: string | null
  logoUrl: string | null
  brandColor: string | null
  status: CampaignStatus
  opensAt: string
  closesAt: string
  votingMode: VotingMode
  pricePerVoteMinor: number
  currency: string
  minVotesPerOrder: number
  maxVotesPerOrder: number | null
  freeVotesPerVoter: number | null
  requireAuthToVote: boolean
  resultsVisibility: ResultsVisibility
  isOpen: boolean
}

export interface CampaignCategorySummary {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  sortOrder: number
  pricePerVoteMinor: number
  nomineeCount: number
}

/** Response of GET /voting/public/organizations/:code/campaigns/:slug */
export interface CampaignLanding extends PublicCampaign {
  organization: OrganizationRef
  categories: CampaignCategorySummary[]
}

export interface BallotNominee {
  id: string
  displayName: string
  slug: string
  imageUrl: string | null
  bio: string | null
  metadata: Record<string, unknown> | null
  status: NomineeStatus
  subjectType: NomineeSubjectType
  subjectId: string | null
  /** Only present when results are public for the campaign. */
  votes?: number
}

/** Response of GET /voting/public/categories/:categoryId */
export interface CategoryBallot {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  pricePerVoteMinor: number
  freeVotesPerVoter: number | null
  campaign: PublicCampaign
  resultsVisible: boolean
  nominees: BallotNominee[]
}

export interface FreeVoteAllowance {
  freeVotingEnabled: boolean
  allowance: number
  used: number
  remaining: number
  window?: FreeVoteWindow | null
}

export interface ResultsNominee {
  id: string
  displayName: string
  imageUrl: string | null
  status: NomineeStatus
  votes: number
  rank: number
  sharePercent: number
}

export interface ResultsCategory {
  id: string
  name: string
  slug: string
  totalVotes: number
  nominees: ResultsNominee[]
}

/** Response of GET /voting/public/campaigns/:campaignId/results */
export interface CampaignResults {
  campaign: PublicCampaign
  resultsVisible: boolean
  message?: string
  categories: ResultsCategory[]
}

/** Response of POST /voting/public/campaigns/:campaignId/vote-orders */
export interface VoteOrderResponse {
  mode: "paid"
  orderId: string
  reference: string
  authorizationUrl: string
  quantity: number
  amountMinor: number
  processingFeeMinor: number
  currency: string
}

export interface NomineeTally {
  nomineeId: string
  categoryId: string
  campaignId: string
  votes: number
  paidVotes: number
  freeVotes: number
  revenueMinor: number
}

/** Response of POST /voting/public/campaigns/:campaignId/free-votes */
export interface FreeVoteResponse {
  mode: "free"
  counted: boolean
  votesRemaining: number
  nominee: { id: string; displayName: string }
  tally: NomineeTally | null
}

/** Response of POST /voting/public/vote-orders/confirm */
export interface ConfirmVoteResponse {
  status: "PENDING" | "PAID" | "FAILED" | "ABANDONED" | "REVERSED"
  counted: boolean
  message?: string
  quantity?: number
  amountMinor?: number
  currency?: string
  paidAt?: string | null
  tally?: NomineeTally | null
}

export interface CastVotePayload {
  nomineeId: string
  quantity?: number
  voterEmail?: string
  voterName?: string
  voterPhone?: string
  callbackUrl?: string
  preferredProvider?: PaymentProviderType
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export interface TrackViewPayload {
  visitorId?: string
  categoryId?: string
  nomineeId?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}
