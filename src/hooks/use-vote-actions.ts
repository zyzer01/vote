import { useMutation, useQueryClient } from "@tanstack/react-query"

import { ApiError } from "@/lib/api/client"
import { castFreeVote, createVoteOrder } from "@/lib/api/voting"
import { queryKeys } from "@/lib/query"
import type { CastVotePayload, CategoryBallot } from "@/lib/api/types"
import { getUtmParams } from "@/lib/visitor"

/**
 * Vote mutations for a category. Free votes update the ballot optimistically
 * and settle from the server response; paid votes create an order and hand
 * off to the selected gateway's hosted checkout via a full-page redirect (so
 * the app never touches card data).
 */
export function useVoteActions(campaignId: string, categoryId: string) {
  const qc = useQueryClient()

  const freeVote = useMutation({
    mutationFn: (nomineeId: string) =>
      castFreeVote(campaignId, { nomineeId }),
    onSuccess: (result) => {
      // Reflect the new tally immediately on the open ballot.
      qc.setQueryData<CategoryBallot>(queryKeys.ballot(categoryId), (prev) => {
        if (!prev || !result.tally) return prev
        return {
          ...prev,
          nominees: prev.nominees.map((n) =>
            n.id === result.nominee.id
              ? { ...n, votes: result.tally!.votes }
              : n,
          ),
        }
      })
      qc.invalidateQueries({ queryKey: queryKeys.allowance(categoryId) })
      qc.invalidateQueries({ queryKey: queryKeys.results(campaignId) })
    },
  })

  const paidCheckout = useMutation({
    mutationFn: (payload: CastVotePayload) => {
      const callbackUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/vote/callback`
          : undefined
      return createVoteOrder(campaignId, {
        ...payload,
        callbackUrl,
        ...getUtmParams(),
      })
    },
    onSuccess: (order) => {
      // Hand off to the gateway's hosted checkout. Stash where to return so
      // the callback page can offer a link straight back to this ballot.
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("sportly.vote.return", window.location.pathname)
        } catch {
          /* storage may be unavailable */
        }
        window.location.assign(order.authorizationUrl)
      }
    },
  })

  return { freeVote, paidCheckout }
}

/** Human-readable message for a vote-related API error. */
export function voteErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return "Something went wrong. Please try again."
}
