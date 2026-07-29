export interface WithdrawalPreview {
  feePercent: number
  grossAmount: number
  platformFeeAmount: number
  netTransferAmount: number
}

export interface WithdrawalStatus {
  id: string
  walletId: string
  bankAccountId: string
  amount: number
  platformFeeAmount?: number | null
  netTransferAmount?: number | null
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED"
  paystackTransferId?: string
  paystackRecipientCode?: string
  reason?: string
  metadata?: any
  initiatedBy: string
  processedAt?: string
  createdAt: string
  updatedAt: string
  bankAccount?: {
    id: string
    accountNumber: string
    accountName: string
    bankName: string
  }
  wallet?: {
    id: string
    balance: number
    currency: string
  }
}

/**
 * Request body for a workspace withdrawal. Deliberately omits `walletId` — the
 * backend resolves it server-side from the vote organization, so a caller can
 * never target a wallet they don't own.
 */
export interface InitiateWithdrawalDto {
  bankAccountId: string
  amount: number
  reason?: string
}

export interface GetWithdrawalsParams {
  status?: string
  page?: number
  limit?: number
}

// Status Enums
export enum WithdrawalStatusEnum {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}
