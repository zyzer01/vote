import { useQuery } from "@tanstack/react-query"
import { getBalanceHistory, walletKeys } from "../api/wallet"
import type { BalanceHistoryRange } from "../interfaces/wallet"

export function useWalletBalanceHistory(
  voteOrganizationId: string,
  range: BalanceHistoryRange,
) {
  return useQuery({
    queryKey: walletKeys.balanceHistory(voteOrganizationId, range),
    queryFn: () => getBalanceHistory(voteOrganizationId, range),
    enabled: !!voteOrganizationId,
  })
}
