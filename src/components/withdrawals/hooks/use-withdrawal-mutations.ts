import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { ApiError } from "@/lib/api/client"
import { walletKeys } from "@/components/wallet/api/wallet"
import {
  initiateWithdrawal as initiateWithdrawalApi,
  withdrawalKeys,
} from "../api/withdrawals"

export function useWithdrawalMutations(voteOrganizationId: string) {
  const queryClient = useQueryClient()

  const initiateWithdrawal = useMutation({
    mutationFn: (dto: { bankAccountId: string; amount: number; reason?: string }) =>
      initiateWithdrawalApi(voteOrganizationId, dto),
    onSuccess: () => {
      toast.success("Withdrawal initiated")
      queryClient.invalidateQueries({ queryKey: withdrawalKeys.all })
      queryClient.invalidateQueries({ queryKey: walletKeys.detail(voteOrganizationId) })
    },
    onError: (error: ApiError) => toast.error(error.message),
  })

  return { initiateWithdrawal }
}
