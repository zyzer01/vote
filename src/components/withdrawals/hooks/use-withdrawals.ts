import { useQuery } from "@tanstack/react-query"
import { getWithdrawalById, getWithdrawals, withdrawalKeys } from "../api/withdrawals"

export function useWithdrawals(voteOrganizationId: string) {
  return useQuery({
    queryKey: withdrawalKeys.list(voteOrganizationId),
    queryFn: () => getWithdrawals(voteOrganizationId),
    enabled: Boolean(voteOrganizationId),
  })
}

export function useWithdrawal(voteOrganizationId: string, id: string) {
  return useQuery({
    queryKey: withdrawalKeys.detail(voteOrganizationId, id),
    queryFn: () => getWithdrawalById(voteOrganizationId, id),
    enabled: Boolean(id),
  })
}
