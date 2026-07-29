export interface BankAccountVerificationStatus {
  id: string
  userId: string
  accountNumber: string
  accountName: string
  bankCode: string
  bankName: string
  isVerified: boolean
  status: "PENDING" | "VERIFIED" | "FAILED"
  verificationData?: any
  createdAt: Date
  updatedAt: Date
}

export interface CreateBankAccountDto {
  accountNumber: string
  bankCode: string
  bankName?: string
  accountName?: string
  country?: string
}

// Status Enums
export enum BankAccountStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  FAILED = "FAILED",
}

// Bank List API Types
export interface Bank {
  id: number
  name: string
  slug: string
  code: string
  longcode: string
  gateway: string | null
  pay_with_bank: boolean
  active: boolean
  country: string
  currency: string
  type: string
  nip_institution_code?: string
}

/**
 * Bank list response, already unwrapped from the API's `{success, data}`
 * envelope by `apiRequest`. The Paystack passthrough keeps its own
 * `{success, message, data, meta}` shape inside that envelope.
 */
export interface BankListResponse {
  success: boolean
  message: string
  data: Bank[]
  meta?: {
    next: string | null
    previous: string | null
    perPage: number
  }
}

export interface GetBanksParams {
  country?: "ghana" | "kenya" | "nigeria" | "south africa"
  perPage?: number
  use_cursor?: boolean
  next?: string
  previous?: string
  include_nip_sort_code?: boolean
  pay_with_bank?: boolean
  pay_with_bank_transfer?: boolean
  enabled_for_verification?: boolean
  gateway?: string
  type?: string
  currency?: string
}

// Account Resolution Types
export interface ResolveAccountParams {
  accountNumber: string
  bankCode: string
}

/** Resolved account, unwrapped from the API's `{success, data}` envelope. */
export interface ResolveAccountResponse {
  account_name: string
  account_number: string
  bank_code?: string
}
