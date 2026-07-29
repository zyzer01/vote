import { queryOptions } from "@tanstack/react-query"

import {
  getCampaign,
  getCampaignAnalytics,
  getCurrentSession,
  listMyWorkspaces,
  listCampaigns,
  listCategories,
  listNominees,
  listOrders,
  type CampaignListQuery,
  type OrderListQuery,
} from "./admin"

export const adminKeys = {
  session: ["admin", "session"] as const,
  workspaces: ["admin", "workspaces"] as const,
  campaigns: (voteOrgId: string, query: CampaignListQuery) =>
    ["admin", "campaigns", voteOrgId, query] as const,
  campaign: (id: string) => ["admin", "campaign", id] as const,
  analytics: (id: string, range: { from?: string; to?: string }) =>
    ["admin", "analytics", id, range] as const,
  orders: (id: string, query: OrderListQuery) =>
    ["admin", "orders", id, query] as const,
  categories: (campaignId: string) =>
    ["admin", "categories", campaignId] as const,
  nominees: (categoryId: string) => ["admin", "nominees", categoryId] as const,
}

export const sessionQuery = () =>
  queryOptions({
    queryKey: adminKeys.session,
    queryFn: getCurrentSession,
    retry: false,
    staleTime: 60_000,
  })

/** Drives the dashboard gate: empty list means the user has no workspace yet. */
export const myWorkspacesQuery = () =>
  queryOptions({
    queryKey: adminKeys.workspaces,
    queryFn: listMyWorkspaces,
    retry: false,
    staleTime: 60_000,
  })

export const campaignsQuery = (voteOrgId: string, query: CampaignListQuery = {}) =>
  queryOptions({
    queryKey: adminKeys.campaigns(voteOrgId, query),
    queryFn: () => listCampaigns(voteOrgId, query),
    enabled: Boolean(voteOrgId),
  })

export const campaignDetailQuery = (id: string) =>
  queryOptions({
    queryKey: adminKeys.campaign(id),
    queryFn: () => getCampaign(id),
  })

export const analyticsQuery = (
  id: string,
  range: { from?: string; to?: string } = {},
) =>
  queryOptions({
    queryKey: adminKeys.analytics(id, range),
    queryFn: () => getCampaignAnalytics(id, range),
    staleTime: 30_000,
  })

export const ordersQuery = (id: string, query: OrderListQuery = {}) =>
  queryOptions({
    queryKey: adminKeys.orders(id, query),
    queryFn: () => listOrders(id, query),
  })

export const categoriesQuery = (campaignId: string) =>
  queryOptions({
    queryKey: adminKeys.categories(campaignId),
    queryFn: () => listCategories(campaignId),
  })

export const nomineesQuery = (categoryId: string, enabled = true) =>
  queryOptions({
    queryKey: adminKeys.nominees(categoryId),
    queryFn: () => listNominees(categoryId),
    enabled,
  })
