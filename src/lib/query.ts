import { QueryClient } from "@tanstack/react-query"

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => {
          // Don't retry 4xx -they won't fix themselves.
          const status = (error as { status?: number })?.status
          if (status && status >= 400 && status < 500) return false
          return failureCount < 2
        },
        refetchOnWindowFocus: false,
      },
    },
  })
}

/** Centralized query keys so invalidation stays consistent. */
export const queryKeys = {
  campaign: (org: string, slug: string) => ["campaign", org, slug] as const,
  ballot: (categoryId: string) => ["ballot", categoryId] as const,
  allowance: (categoryId: string) => ["allowance", categoryId] as const,
  results: (campaignId: string) => ["results", campaignId] as const,
}
