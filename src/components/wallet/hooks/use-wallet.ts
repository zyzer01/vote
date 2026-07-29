import { useQuery } from "@tanstack/react-query"
import {
  getWallet,
  getWalletTransactionTotals,
  walletKeys,
} from "../api/wallet"

export function useWallet(voteOrganizationId: string) {
  return useQuery({
    queryKey: walletKeys.detail(voteOrganizationId),
    queryFn: () => getWallet(voteOrganizationId),
    enabled: !!voteOrganizationId,
  })
}

export function useWalletTransactionTotals(voteOrganizationId: string) {
  return useQuery({
    queryKey: walletKeys.transactionTotals(voteOrganizationId),
    queryFn: () => getWalletTransactionTotals(voteOrganizationId),
    enabled: !!voteOrganizationId,
  })
}
