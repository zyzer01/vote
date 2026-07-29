export interface WalletBalance {
  id: string
  balance: number
  currency: string // Always "NGN"
  voteOrganizationId?: string
  status: "ACTIVE" | "SUSPENDED" | "CLOSED"
  createdAt: Date
  updatedAt: Date
}

export interface TransactionSummary {
  id: string
  type: "CREDIT" | "DEBIT"
  amount: number
  balanceBefore: number
  balanceAfter: number
  reference: string
  description?: string
  status: string
  metadata?: any
  createdAt: Date
}

export interface GetTransactionsParams {
  type?: "CREDIT" | "DEBIT"
  status?: string
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
}

export type BalanceHistoryRange = "7d" | "30d" | "90d" | "1y"

export interface BalanceHistoryPoint {
  date: string
  balance: number
}

export interface BalanceHistoryResponse {
  currency: string
  range: BalanceHistoryRange
  fromDate: string
  toDate: string
  openingBalance: number
  closingBalance: number
  netChange: number
  points: BalanceHistoryPoint[]
}

/** Sum of completed credits (all-time revenue), debits, and in-flight withdrawals */
export interface WalletTransactionTotals {
  allTimeRevenue: number
  totalDebits: number
  pendingWithdrawalsAmount: number
}
