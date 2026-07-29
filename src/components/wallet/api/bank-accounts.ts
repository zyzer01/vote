import { apiRequest } from "@/lib/api/client"
import type {
  BankAccountVerificationStatus,
  BankListResponse,
  CreateBankAccountDto,
  GetBanksParams,
  ResolveAccountParams,
  ResolveAccountResponse,
} from "../interfaces/bank-account"

const V1 = "/v1/voting/bank-accounts"

export const bankAccountKeys = {
  all: ["bank-accounts"] as const,
  lists: () => [...bankAccountKeys.all, "list"] as const,
  list: (filters: object) => [...bankAccountKeys.lists(), { filters }] as const,
  details: () => [...bankAccountKeys.all, "detail"] as const,
  detail: (id: string) => [...bankAccountKeys.details(), id] as const,
  verified: () => [...bankAccountKeys.all, "verified"] as const,
  banks: () => [...bankAccountKeys.all, "banks"] as const,
  banksList: (params: GetBanksParams) => [...bankAccountKeys.banks(), params] as const,
}

export function createBankAccount(
  data: CreateBankAccountDto,
): Promise<BankAccountVerificationStatus> {
  return apiRequest(V1, { method: "POST", body: data })
}

export function getUserBankAccounts(): Promise<BankAccountVerificationStatus[]> {
  return apiRequest(V1)
}

export function getVerifiedBankAccounts(): Promise<BankAccountVerificationStatus[]> {
  return apiRequest(`${V1}/verified`)
}

export function setPrimaryBankAccount(accountId: string): Promise<void> {
  return apiRequest(`${V1}/${accountId}/primary`, { method: "PUT" })
}

export function deleteBankAccount(accountId: string): Promise<void> {
  return apiRequest(`${V1}/${accountId}`, { method: "DELETE" })
}

export function getBanks(params: GetBanksParams = {}): Promise<BankListResponse> {
  return apiRequest(`${V1}/banks`, {
    query: { country: "nigeria", ...params },
  })
}

export function resolveAccount(params: ResolveAccountParams): Promise<ResolveAccountResponse> {
  return apiRequest(`${V1}/resolve`, {
    query: { accountNumber: params.accountNumber, bankCode: params.bankCode },
  })
}
