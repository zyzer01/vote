import { useQuery, useMutation } from "@tanstack/react-query"
import {
  getUserBankAccounts,
  getVerifiedBankAccounts,
  getBanks,
  resolveAccount,
  bankAccountKeys,
} from "../api/bank-accounts"
import type { GetBanksParams, ResolveAccountParams } from "../interfaces/bank-account"

export function useBankAccounts() {
  return useQuery({
    queryKey: bankAccountKeys.lists(),
    queryFn: getUserBankAccounts,
  })
}

export function useVerifiedBankAccounts() {
  return useQuery({
    queryKey: bankAccountKeys.verified(),
    queryFn: getVerifiedBankAccounts,
  })
}

export function useBanks(params: GetBanksParams = {}) {
  return useQuery({
    queryKey: bankAccountKeys.banksList(params),
    queryFn: () => getBanks(params),
  })
}

export function useResolveAccount() {
  return useMutation({
    mutationFn: (params: ResolveAccountParams) => resolveAccount(params),
  })
}
