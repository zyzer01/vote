/**
 * Types mirroring the admin voting API payloads (`/v1/voting/...` admin surface)
 * and the version-neutral auth surface (`/auth/...`). Hand-written to match the
 * NestJS service return shapes so the dashboard only depends on documented fields.
 */

import type {
  CampaignStatus,
  FreeVoteWindow,
  NomineeStatus,
  NomineeSubjectType,
  OrganizationRef,
  ResultsVisibility,
  VotingMode,
} from "./types"

export type CategoryStatus = "ACTIVE" | "HIDDEN" | "CLOSED"

export type ProcessingFeeHandling = "PASS_TO_VOTER" | "ORGANIZATION_COVERS"

export type VoteOrderStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "ABANDONED"
  | "REVERSED"

// --- Auth -------------------------------------------------------------------

export interface AuthUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  image: string | null
  emailVerified: boolean
  onboardingCompleted: boolean
  organizationId: string | null
  organizationRole: string | null
  impersonatedBy?: string | null
}

export interface SessionResponse {
  session: {
    id: string
    token: string
    expiresAt: string
    createdAt: string
  }
  user: AuthUser
}

export interface SigninResponse {
  user: AuthUser
}

export interface AccessGrant {
  id: string
  organizationId: string | null
  role: string
  scopeType: string
  scopeId: string | null
  region: string | null
  expiresAt: string | null
}

export interface AccessProfile {
  grants: AccessGrant[]
  capabilities: Record<string, boolean>
}

// --- Campaigns --------------------------------------------------------------

/** Full campaign row from the admin service (create/update/get). */
export interface AdminCampaign {
  id: string
  organizationId: string
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
  processingFeeHandling: ProcessingFeeHandling
  freeVotesPerVoter: number | null
  freeVoteWindow: FreeVoteWindow | null
  requireAuthToVote: boolean
  resultsVisibility: ResultsVisibility
  platformFeeBps: number
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminCampaignListItem extends AdminCampaign {
  _count: { categories: number; nominees: number }
}

export interface AdminCampaignDetail extends AdminCampaign {
  organization: OrganizationRef
  categories: AdminCategory[]
  _count: { nominees: number; orders: number; votes: number }
}

export interface Paginated<T> {
  items: T[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

// --- Categories -------------------------------------------------------------

export interface AdminCategory {
  id: string
  campaignId: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  sortOrder: number
  pricePerVoteMinor: number | null
  freeVotesPerVoter: number | null
  status: CategoryStatus
  createdAt: string
  updatedAt: string
  _count?: { nominees: number }
}

// --- Nominees ---------------------------------------------------------------

export interface AdminNomineeTally {
  nomineeId: string
  categoryId: string
  campaignId: string
  votes: number
  paidVotes: number
  freeVotes: number
  revenueMinor: number
}

export interface AdminNominee {
  id: string
  campaignId: string
  categoryId: string
  displayName: string
  slug: string
  imageUrl: string | null
  bio: string | null
  metadata: Record<string, unknown> | null
  sortOrder: number
  status: NomineeStatus
  subjectType: NomineeSubjectType
  subjectId: string | null
  disqualifiedReason?: string | null
  createdAt: string
  updatedAt: string
  tally: AdminNomineeTally | null
}

export interface BulkNomineeResult {
  created: number
  failed: number
  results: Array<{
    index: number
    ok: boolean
    id?: string
    displayName?: string
    error?: string
  }>
}

// --- Analytics --------------------------------------------------------------

export interface AnalyticsTotals {
  pageViews: number
  uniqueVisitors: number
  votes: number
  paidVotes: number
  freeVotes: number
  ordersCreated: number
  ordersPaid: number
  ordersFailed: number
  grossRevenueMinor: number
  netRevenueMinor: number
  currency: string
}

export interface AnalyticsPoint {
  date: string
  pageViews: number
  uniqueVisitors: number
  votes: number
  paidVotes: number
  freeVotes: number
  ordersPaid: number
  ordersFailed: number
  grossRevenueMinor: number
  netRevenueMinor: number
}

export interface AnalyticsTopNominee {
  nomineeId: string
  displayName: string
  imageUrl: string | null
  categoryId: string
  votes: number
  paidVotes: number
  freeVotes: number
  revenueMinor: number
}

export interface AnalyticsCategoryRevenue {
  categoryId: string
  name: string
  orders: number
  votes: number
  grossRevenueMinor: number
  netRevenueMinor: number
}

export interface AnalyticsTrafficSource {
  source: string
  views: number
}

export interface CampaignAnalytics {
  campaign: {
    id: string
    name: string
    slug: string
    status: CampaignStatus
    currency: string
    votingMode: VotingMode
    pricePerVoteMinor: number
    opensAt: string
    closesAt: string
    organizationId: string
  }
  range: { from: string; to: string }
  totals: AnalyticsTotals
  rates: { viewToVotePercent: number; checkoutCompletionPercent: number }
  timeseries: AnalyticsPoint[]
  topNominees: AnalyticsTopNominee[]
  revenueByCategory: AnalyticsCategoryRevenue[]
  trafficSources: AnalyticsTrafficSource[]
}

// --- Orders -----------------------------------------------------------------

export interface AdminOrder {
  id: string
  campaignId: string
  categoryId: string
  nomineeId: string
  status: VoteOrderStatus
  quantity: number
  amountMinor: number
  processingFeeMinor: number
  settlementMinor: number
  currency: string
  voterEmail: string | null
  voterName: string | null
  voterPhone: string | null
  paymentReference: string | null
  paidAt: string | null
  createdAt: string
  nominee: { id: string; displayName: string } | null
  category: { id: string; name: string } | null
}

// --- Request payloads -------------------------------------------------------

export interface CampaignPayload {
  name: string
  slug?: string
  description?: string
  coverImageUrl?: string
  logoUrl?: string
  brandColor?: string
  opensAt: string
  closesAt: string
  votingMode?: VotingMode
  pricePerVoteMinor?: number
  currency?: string
  minVotesPerOrder?: number
  maxVotesPerOrder?: number | null
  processingFeeHandling?: ProcessingFeeHandling
  freeVotesPerVoter?: number | null
  freeVoteWindow?: FreeVoteWindow
  requireAuthToVote?: boolean
  resultsVisibility?: ResultsVisibility
}

export interface CategoryPayload {
  name: string
  slug?: string
  description?: string
  imageUrl?: string
  sortOrder?: number
  pricePerVoteMinor?: number
  freeVotesPerVoter?: number
  status?: CategoryStatus
}

export interface NomineePayload {
  subjectType?: NomineeSubjectType
  subjectId?: string
  displayName?: string
  slug?: string
  imageUrl?: string
  bio?: string
  metadata?: Record<string, unknown>
  sortOrder?: number
  status?: NomineeStatus
}
