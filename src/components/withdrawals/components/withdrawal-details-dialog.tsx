import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatNaira, formatDate } from "@/lib/format"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useWithdrawalsContext } from "../context/withdrawals-context"
import { getWithdrawalStatusVariant, getWithdrawalStatusLabel } from "../utils/status-helpers"
import { Banknote, Calendar, Hash, Building } from "lucide-react"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WithdrawalDetailsDialog({ open, onOpenChange }: Props) {
  const { selectedWithdrawal } = useWithdrawalsContext()
  if (!selectedWithdrawal) {
    return null
  }

  const withdrawal = selectedWithdrawal
  const bankAccount = withdrawal.bankAccount
  const metadata = (withdrawal.metadata as Record<string, unknown> | null) ?? null
  const initiatedByName =
    (typeof metadata?.initiatedByName === "string" && metadata.initiatedByName) ||
    (typeof metadata?.initiatorName === "string" && metadata.initiatorName) ||
    (typeof metadata?.initiatedByDisplayName === "string" && metadata.initiatedByDisplayName) ||
    ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Withdrawal Details</DialogTitle>
          <DialogDescription>
            View detailed information about this withdrawal request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Amount */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Banknote className="h-5 w-5" />
                {formatNaira(withdrawal.amount)}
              </h3>
              <p className="text-muted-foreground text-sm">From wallet (gross)</p>
              {(withdrawal.platformFeeAmount != null ||
                withdrawal.netTransferAmount != null) && (
                <div className="mt-2 space-y-1 text-sm">
                  {withdrawal.platformFeeAmount != null && (
                    <p className="text-muted-foreground">
                      Platform fee:{" "}
                      <span className="text-foreground font-medium tabular-nums">
                        {formatNaira(withdrawal.platformFeeAmount)}
                      </span>
                    </p>
                  )}
                  {withdrawal.netTransferAmount != null && (
                    <p className="text-muted-foreground">
                      You&apos;ll receive:{" "}
                      <span className="font-semibold tabular-nums text-green-700 dark:text-green-400">
                        {formatNaira(withdrawal.netTransferAmount)}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
            <Badge variant={getWithdrawalStatusVariant(withdrawal.status)} className="capitalize">
              {getWithdrawalStatusLabel(withdrawal.status)}
            </Badge>
          </div>

          {/* Bank Account Details */}
          {bankAccount && (
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-medium">
                <Building className="h-4 w-4" />
                Bank Account Details
              </h4>
              <div className="grid gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-2 dark:bg-gray-900">
                <div>
                  <p className="text-muted-foreground text-sm">Account Name</p>
                  <p className="wrap-break-word font-medium">{bankAccount.accountName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Account Number</p>
                  <p className="font-medium">{bankAccount.accountNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Bank</p>
                  <p className="font-medium">{bankAccount.bankName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Withdrawal Information */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-medium">
              <Hash className="h-4 w-4" />
              Withdrawal Information
            </h4>
            <div className="grid gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-2 dark:bg-gray-900">
              <div>
                <p className="text-muted-foreground text-sm">Reference ID</p>
                <p className="font-mono text-sm break-all">{withdrawal.id}</p>
              </div>
              {initiatedByName ? (
                <div>
                  <p className="text-muted-foreground text-sm">Initiated By</p>
                  <p className="wrap-break-word font-medium">{initiatedByName}</p>
                </div>
              ) : null}
              <div>
                <p className="text-muted-foreground text-sm">Initiated Date</p>
                <p className="flex items-center gap-1 font-medium">
                  <Calendar className="h-3 w-3" />
                  {formatDate(withdrawal.createdAt)}
                </p>
              </div>
              {withdrawal.processedAt && (
                <div>
                  <p className="text-muted-foreground text-sm">Processed Date</p>
                  <p className="flex items-center gap-1 font-medium">
                    <Calendar className="h-3 w-3" />
                    {formatDate(withdrawal.processedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Paystack Information */}
          {(withdrawal.paystackTransferId || withdrawal.paystackRecipientCode) && (
            <div className="space-y-3">
              <h4 className="font-medium">Payment Provider Details</h4>
              <div className="space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                {withdrawal.paystackTransferId && (
                  <div>
                    <p className="text-muted-foreground text-sm">Paystack Transfer ID</p>
                    <p className="font-mono text-sm break-all">
                      {withdrawal.paystackTransferId}
                    </p>
                  </div>
                )}
                {withdrawal.paystackRecipientCode && (
                  <div>
                    <p className="text-muted-foreground text-sm">Paystack Recipient Code</p>
                    <p className="font-mono text-sm break-all">
                      {withdrawal.paystackRecipientCode}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata (technical) */}
          {withdrawal.metadata &&
            Object.keys(withdrawal.metadata as object).length > 0 && (
              <div className="space-y-3">
                <h4 className="text-muted-foreground text-sm font-medium">Technical metadata</h4>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                  <pre className="max-h-40 overflow-auto text-xs break-all whitespace-pre-wrap">
                    {JSON.stringify(withdrawal.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
