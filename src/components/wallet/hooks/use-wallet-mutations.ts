import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { ApiError } from "@/lib/api/client"
import {
  createBankAccount,
  setPrimaryBankAccount,
  deleteBankAccount,
  resolveAccount,
  bankAccountKeys,
} from "../api/bank-accounts"
import type { ResolveAccountParams } from "../interfaces/bank-account"

export function useWalletMutations() {
  const queryClient = useQueryClient()

  const createBankAccountMutation = useMutation({
    mutationFn: createBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.all })
      toast.success("Bank account added successfully")
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to add bank account")
    },
  })

  const setPrimaryBankAccountMutation = useMutation({
    mutationFn: setPrimaryBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.all })
      toast.success("Primary bank account updated")
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to update primary bank account")
    },
  })

  const deleteBankAccountMutation = useMutation({
    mutationFn: deleteBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.all })
      toast.success("Bank account deleted successfully")
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to delete bank account")
    },
  })

  return {
    createBankAccount: createBankAccountMutation,
    setPrimaryBankAccount: setPrimaryBankAccountMutation,
    deleteBankAccount: deleteBankAccountMutation,
  }
}

export function useVerifyAccount(onSuccess?: (accountName: string) => void) {
  return useMutation({
    mutationFn: (params: ResolveAccountParams) => resolveAccount(params),
    onSuccess: (data) => {
      if (data.account_name && onSuccess) {
        onSuccess(data.account_name)
      }
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to verify account")
    },
  })
}
