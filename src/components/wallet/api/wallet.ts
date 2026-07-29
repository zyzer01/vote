import { apiRequest } from "@/lib/api/client"
import type { Paginated } from "@/lib/api/admin-types"
import type {
  WalletBalance,
  TransactionSummary,
  GetTransactionsParams,
  BalanceHistoryRange,
  BalanceHistoryResponse,
  WalletTransactionTotals,
} from "../interfaces/wallet"

const V1 = "/v1/voting/vote-organizations"

export const walletKeys = {
  all: ["wallet"] as const,
  detail: (voteOrganizationId: string) => [...walletKeys.all, voteOrganizationId] as const,
  transactions: (voteOrganizationId: string, filter: GetTransactionsParams) =>
    [...walletKeys.detail(voteOrganizationId), "transactions", filter] as const,
  balanceHistory: (voteOrganizationId: string, range: BalanceHistoryRange) =>
    [...walletKeys.detail(voteOrganizationId), "balance-history", range] as const,
  transactionTotals: (voteOrganizationId: string) =>
    [...walletKeys.detail(voteOrganizationId), "transaction-totals"] as const,
}

/** Raw transaction row from the API — money fields are Prisma Decimal, serialized as strings. */
interface TransactionSummaryRaw
  extends Omit<TransactionSummary, "amount" | "balanceBefore" | "balanceAfter"> {
  amount: string | number
  balanceBefore: string | number
  balanceAfter: string | number
}

function normalizeTransaction(item: TransactionSummaryRaw): TransactionSummary {
  return {
    ...item,
    amount: Number(item.amount),
    balanceBefore: Number(item.balanceBefore),
    balanceAfter: Number(item.balanceAfter),
  }
}

export function getWallet(voteOrganizationId: string): Promise<WalletBalance> {
  return apiRequest(`${V1}/${voteOrganizationId}/wallet`)
}

export function getBalanceHistory(
  voteOrganizationId: string,
  range: BalanceHistoryRange,
): Promise<BalanceHistoryResponse> {
  return apiRequest(`${V1}/${voteOrganizationId}/wallet/balance-history`, { query: { range } })
}

export function getWalletTransactionTotals(
  voteOrganizationId: string,
): Promise<WalletTransactionTotals> {
  return apiRequest(`${V1}/${voteOrganizationId}/wallet/transaction-totals`)
}

export async function getWalletTransactions(
  voteOrganizationId: string,
  params: GetTransactionsParams = {},
): Promise<Paginated<TransactionSummary>> {
  const result = await apiRequest<Paginated<TransactionSummaryRaw>>(
    `${V1}/${voteOrganizationId}/wallet/transactions`,
    { query: { ...params } },
  )
  return { ...result, items: result.items.map(normalizeTransaction) }
}
