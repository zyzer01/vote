import { apiRequest } from "@/lib/api/client"
import type { WithdrawalPreview, WithdrawalStatus } from "../interfaces/withdrawal"

const V1 = "/v1/voting/vote-organizations"

export const withdrawalKeys = {
  all: ["withdrawals"] as const,
  list: (voteOrganizationId: string) =>
    [...withdrawalKeys.all, voteOrganizationId, "list"] as const,
  detail: (voteOrganizationId: string, id: string) =>
    [...withdrawalKeys.all, voteOrganizationId, "detail", id] as const,
  preview: (voteOrganizationId: string, amount: number) =>
    [...withdrawalKeys.all, voteOrganizationId, "preview", amount] as const,
}

/** Money fields arrive as Prisma Decimal strings even though typed as number. */
function normalizeWithdrawal(w: WithdrawalStatus): WithdrawalStatus {
  return {
    ...w,
    amount: Number(w.amount),
    platformFeeAmount: w.platformFeeAmount != null ? Number(w.platformFeeAmount) : w.platformFeeAmount,
    netTransferAmount:
      w.netTransferAmount != null ? Number(w.netTransferAmount) : w.netTransferAmount,
    wallet: w.wallet ? { ...w.wallet, balance: Number(w.wallet.balance) } : w.wallet,
  }
}

export function getWithdrawalPreview(
  voteOrganizationId: string,
  amount: number,
): Promise<WithdrawalPreview> {
  return apiRequest(`${V1}/${voteOrganizationId}/withdrawals/preview`, {
    query: { amount },
  })
}

export async function initiateWithdrawal(
  voteOrganizationId: string,
  dto: { bankAccountId: string; amount: number; reason?: string },
): Promise<WithdrawalStatus> {
  const result = await apiRequest<WithdrawalStatus>(
    `${V1}/${voteOrganizationId}/withdrawals`,
    { method: "POST", body: dto },
  )
  return normalizeWithdrawal(result)
}

export async function getWithdrawals(
  voteOrganizationId: string,
): Promise<WithdrawalStatus[]> {
  const result = await apiRequest<WithdrawalStatus[]>(
    `${V1}/${voteOrganizationId}/withdrawals`,
  )
  return result.map(normalizeWithdrawal)
}

export async function getWithdrawalById(
  voteOrganizationId: string,
  id: string,
): Promise<WithdrawalStatus> {
  const result = await apiRequest<WithdrawalStatus>(
    `${V1}/${voteOrganizationId}/withdrawals/${id}`,
  )
  return normalizeWithdrawal(result)
}
