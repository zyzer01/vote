import { useQuery } from "@tanstack/react-query"
import { getWalletTransactions, walletKeys } from "../api/wallet"
import type { GetTransactionsParams } from "../interfaces/wallet"

export function useTransactions(
  voteOrganizationId: string,
  params: GetTransactionsParams = {},
) {
  return useQuery({
    queryKey: walletKeys.transactions(voteOrganizationId, params),
    queryFn: () => getWalletTransactions(voteOrganizationId, params),
    enabled: !!voteOrganizationId,
  })
}
