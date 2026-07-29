import { useEffect, useMemo, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { Info, Minus, Plus } from "lucide-react"
import { z } from "zod"

import { useAuth } from "@/lib/auth"
import { formatNaira } from "@/lib/format"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useWallet } from "@/components/wallet/hooks/use-wallet"
import { useVerifiedBankAccounts } from "@/components/wallet/hooks/use-bank-accounts"
import { getWithdrawalPreview, withdrawalKeys } from "../api/withdrawals"
import { useWithdrawalMutations } from "../hooks/use-withdrawal-mutations"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WithdrawalFormDialog({ open, onOpenChange }: Props) {
  const { voteOrganizationId } = useAuth()

  const { data: wallet } = useWallet(voteOrganizationId)
  const { data: bankAccounts = [] } = useVerifiedBankAccounts()
  const { initiateWithdrawal } = useWithdrawalMutations(voteOrganizationId)

  const availableBalance = wallet?.balance ?? 0

  const withdrawalSchema = useMemo(
    () =>
      z.object({
        bankAccountId: z.string().min(1, "Bank account is required"),
        amount: z
          .number()
          .min(100, "Minimum withdrawal is ₦100")
          .max(availableBalance, `Maximum is ${formatNaira(availableBalance)}`),
      }),
    [availableBalance],
  )

  type WithdrawalForm = z.infer<typeof withdrawalSchema>

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WithdrawalForm>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: { bankAccountId: "", amount: 0 },
  })

  const watchedAmount = useWatch({ control, name: "amount" })
  const [debouncedAmount, setDebouncedAmount] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedAmount(
        typeof watchedAmount === "number" && !Number.isNaN(watchedAmount) ? watchedAmount : 0,
      )
    }, 350)
    return () => clearTimeout(t)
  }, [watchedAmount])

  const { data: preview } = useQuery({
    queryKey: withdrawalKeys.preview(voteOrganizationId, debouncedAmount),
    queryFn: () => getWithdrawalPreview(voteOrganizationId, debouncedAmount),
    enabled: debouncedAmount >= 100,
  })
  // initiateWithdrawal.mutate below only needs { bankAccountId, amount } — voteOrganizationId
  // is already bound into the mutation via useWithdrawalMutations(voteOrganizationId) above.

  const onSubmit = (values: WithdrawalForm) => {
    initiateWithdrawal.mutate(values, {
      onSuccess: () => {
        reset()
        onOpenChange(false)
      },
    })
  }

  if (bankAccounts.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="text-left">
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              You need to add and verify a bank account before you can withdraw funds.
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-4">No verified bank accounts found</p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-left">
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription>
            Withdraw from your wallet to your bank account. The platform fee applies to each
            withdrawal; you receive the net amount shown below.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-primary/10 mb-2 rounded-lg p-3">
          <p className="text-sm">
            Available Balance:{" "}
            <span className="font-semibold">{formatNaira(availableBalance)}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={control}
            name="bankAccountId"
            render={({ field }) => (
              <Field label="Bank Account" error={errors.bankAccountId?.message}>
                <Select
                  items={bankAccounts.map((account) => ({
                    value: account.id,
                    label: `${account.accountName} - ${account.accountNumber} (${account.bankName})`,
                  }))}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.accountName} - {account.accountNumber} ({account.bankName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <Field
                label="Amount from wallet (NGN)"
                error={errors.amount?.message}
                hint={`Gross amount deducted from your wallet on success. Minimum: ₦100, maximum: ${formatNaira(availableBalance)}`}
              >
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => field.onChange(Math.max(100, (field.value || 0) - 100))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    min="100"
                    max={availableBalance}
                    value={field.value}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      field.onChange(Math.min(availableBalance, (field.value || 0) + 100))
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </Field>
            )}
          />

          {preview && debouncedAmount >= 100 && (
            <div className="bg-muted/40 space-y-2 rounded-lg border px-3 py-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">From wallet</span>
                <span className="font-medium tabular-nums">{formatNaira(preview.grossAmount)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground flex items-center gap-1">
                  Platform fee ({preview.feePercent}%)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span className="inline-flex cursor-help">
                            <Info className="h-3.5 w-3.5" />
                          </span>
                        }
                      />
                      <TooltipContent>
                        This fee covers interbank transfer costs and platform handling
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
                <span className="font-medium tabular-nums text-amber-700 dark:text-amber-400">
                  −{formatNaira(preview.platformFeeAmount)}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-t pt-2 font-semibold">
                <span>You&apos;ll receive</span>
                <span className="tabular-nums text-green-700 dark:text-green-400">
                  {formatNaira(preview.netTransferAmount)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={initiateWithdrawal.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={initiateWithdrawal.isPending || availableBalance < 100}>
              {initiateWithdrawal.isPending ? "Initiating..." : "Initiate Withdrawal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
