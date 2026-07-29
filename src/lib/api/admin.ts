/**
 * Admin voting API -maps to `VotingAdminController` (`/v1/voting/...`) and the
 * version-neutral auth surface (`/auth/...`). Cookie auth via the shared client.
 */
import { apiRequest } from "./client"
import type {
  VoteWorkspace,
  AdminCampaignDetail,
  AdminCampaignListItem,
  AdminCategory,
  AdminNominee,
  AdminOrder,
  BulkNomineeResult,
  CampaignAnalytics,
  CampaignPayload,
  CategoryPayload,
  NomineePayload,
  Paginated,
  SessionResponse,
  SigninResponse,
} from "./admin-types"
import type { CampaignStatus } from "./types"

const V1 = "/v1/voting"

// --- Auth -------------------------------------------------------------------

export function signin(email: string, password: string) {
  return apiRequest<SigninResponse>("/auth/signin", {
    method: "POST",
    body: { email, password },
  })
}

export function signout() {
  return apiRequest<{ message?: string }>("/auth/signout", { method: "POST" })
}

export function getCurrentSession() {
  return apiRequest<SessionResponse>("/auth/session")
}

/** The caller's voting workspaces. An empty list means "offer to create one". */
export function listMyWorkspaces() {
  return apiRequest<VoteWorkspace[]>("/v1/vote-organizations/mine")
}

export function createWorkspace(name: string) {
  return apiRequest<{ id: string; name: string; code: string }>(
    "/v1/vote-organizations",
    { method: "POST", body: { name } },
  )
}

/** Creates the Sportly account only — the workspace is a separate, later step. */
export function signup(payload: {
  email: string
  firstName: string
  lastName: string
}) {
  return apiRequest<{ message: string }>("/auth/signup", {
    method: "POST",
    body: payload,
  })
}

export function verifyEmail(token: string, password: string) {
  return apiRequest<SigninResponse>("/auth/verify-email", {
    method: "POST",
    body: { token, password },
  })
}

export function signInWithGoogle(code: string) {
  return apiRequest<SigninResponse>("/auth/google/token", {
    method: "POST",
    body: { token: code },
  })
}

// --- Media ------------------------------------------------------------------

export interface UploadedMedia {
  url: string
  publicId: string
  folder: string
}

/**
 * Uploads an image to the shared media service and returns its hosted URL. The
 * returned `url` is what we persist in fields like `coverImageUrl`/`logoUrl`.
 * `folder` groups files in storage (e.g. "campaign-covers").
 */
export function uploadImage(file: File, folder: string) {
  const form = new FormData()
  form.append("file", file)
  form.append("folder", folder)
  return apiRequest<UploadedMedia>("/v1/media/file-upload", {
    method: "POST",
    body: form,
  })
}

// --- Campaigns --------------------------------------------------------------

export type CampaignListQuery = {
  status?: CampaignStatus
  search?: string
  page?: number
  limit?: number
}

export function listCampaigns(voteOrgId: string, query: CampaignListQuery = {}) {
  return apiRequest<Paginated<AdminCampaignListItem>>(
    `${V1}/vote-organizations/${voteOrgId}/campaigns`,
    { query },
  )
}

export function getCampaign(campaignId: string) {
  return apiRequest<AdminCampaignDetail>(`${V1}/campaigns/${campaignId}`)
}

export function createCampaign(voteOrgId: string, payload: CampaignPayload) {
  return apiRequest<AdminCampaignDetail>(
    `${V1}/vote-organizations/${voteOrgId}/campaigns`,
    { method: "POST", body: payload },
  )
}

export function updateCampaign(
  campaignId: string,
  payload: Partial<CampaignPayload>,
) {
  return apiRequest<AdminCampaignDetail>(`${V1}/campaigns/${campaignId}`, {
    method: "PATCH",
    body: payload,
  })
}

export function publishCampaign(campaignId: string) {
  return apiRequest<AdminCampaignDetail>(`${V1}/campaigns/${campaignId}/publish`, {
    method: "POST",
  })
}

export function pauseCampaign(campaignId: string) {
  return apiRequest<AdminCampaignDetail>(`${V1}/campaigns/${campaignId}/pause`, {
    method: "POST",
  })
}

export function closeCampaign(campaignId: string) {
  return apiRequest<AdminCampaignDetail>(`${V1}/campaigns/${campaignId}/close`, {
    method: "POST",
  })
}

export function deleteCampaign(campaignId: string) {
  return apiRequest<void>(`${V1}/campaigns/${campaignId}`, { method: "DELETE" })
}

// --- Analytics --------------------------------------------------------------

export function getCampaignAnalytics(
  campaignId: string,
  range: { from?: string; to?: string } = {},
) {
  return apiRequest<CampaignAnalytics>(`${V1}/campaigns/${campaignId}/analytics`, {
    query: range,
  })
}

export type OrderListQuery = {
  status?: string
  categoryId?: string
  nomineeId?: string
  search?: string
  page?: number
  limit?: number
}

export function listOrders(campaignId: string, query: OrderListQuery = {}) {
  return apiRequest<Paginated<AdminOrder>>(
    `${V1}/campaigns/${campaignId}/orders`,
    { query },
  )
}

// --- Categories -------------------------------------------------------------

export function listCategories(campaignId: string) {
  return apiRequest<AdminCategory[]>(`${V1}/campaigns/${campaignId}/categories`)
}

export function createCategory(campaignId: string, payload: CategoryPayload) {
  return apiRequest<AdminCategory>(`${V1}/campaigns/${campaignId}/categories`, {
    method: "POST",
    body: payload,
  })
}

export function updateCategory(categoryId: string, payload: Partial<CategoryPayload>) {
  return apiRequest<AdminCategory>(`${V1}/categories/${categoryId}`, {
    method: "PATCH",
    body: payload,
  })
}

export function deleteCategory(categoryId: string) {
  return apiRequest<void>(`${V1}/categories/${categoryId}`, { method: "DELETE" })
}

// --- Nominees ---------------------------------------------------------------

export function listNominees(categoryId: string) {
  return apiRequest<AdminNominee[]>(`${V1}/categories/${categoryId}/nominees`)
}

export function createNominee(categoryId: string, payload: NomineePayload) {
  return apiRequest<AdminNominee>(`${V1}/categories/${categoryId}/nominees`, {
    method: "POST",
    body: payload,
  })
}

export function bulkCreateNominees(categoryId: string, nominees: NomineePayload[]) {
  return apiRequest<BulkNomineeResult>(
    `${V1}/categories/${categoryId}/nominees/bulk`,
    { method: "POST", body: { nominees } },
  )
}

export function updateNominee(nomineeId: string, payload: Partial<NomineePayload>) {
  return apiRequest<AdminNominee>(`${V1}/nominees/${nomineeId}`, {
    method: "PATCH",
    body: payload,
  })
}

export function disqualifyNominee(nomineeId: string, reason?: string) {
  return apiRequest<AdminNominee>(`${V1}/nominees/${nomineeId}/disqualify`, {
    method: "POST",
    body: { reason },
  })
}

export function deleteNominee(nomineeId: string) {
  return apiRequest<void>(`${V1}/nominees/${nomineeId}`, { method: "DELETE" })
}
