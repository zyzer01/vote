import { queryOptions } from "@tanstack/react-query"

import {
  getAccessProfile,
  getCampaign,
  getCampaignAnalytics,
  getCurrentSession,
  getOrganization,
  listCampaigns,
  listCategories,
  listNominees,
  listOrders,
  type CampaignListQuery,
  type OrderListQuery,
} from "./admin"

export const adminKeys = {
  session: ["admin", "session"] as const,
  access: ["admin", "access"] as const,
  organization: (id: string) => ["admin", "organization", id] as const,
  campaigns: (orgId: string, query: CampaignListQuery) =>
    ["admin", "campaigns", orgId, query] as const,
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

export const accessQuery = () =>
  queryOptions({
    queryKey: adminKeys.access,
    queryFn: getAccessProfile,
    retry: false,
    staleTime: 60_000,
  })

export const organizationQuery = (id: string) =>
  queryOptions({
    queryKey: adminKeys.organization(id),
    queryFn: () => getOrganization(id),
    enabled: Boolean(id),
    staleTime: 5 * 60_000,
  })

export const campaignsQuery = (orgId: string, query: CampaignListQuery = {}) =>
  queryOptions({
    queryKey: adminKeys.campaigns(orgId, query),
    queryFn: () => listCampaigns(orgId, query),
    enabled: Boolean(orgId),
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
