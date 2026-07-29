import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
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
import { useWalletMutations, useVerifyAccount } from "../hooks/use-wallet-mutations"
import { useBanks } from "../hooks/use-bank-accounts"

const bankAccountSchema = z.object({
  accountNumber: z
    .string()
    .length(10, "Account number must be 10 digits")
    .regex(/^\d{10}$/, "Account number must contain only digits"),
  bankCode: z.string().min(1, "Bank is required"),
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  country: z.string().min(1, "Country is required"),
})

type BankAccountForm = z.infer<typeof bankAccountSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const supportedCountriesList = [
  { name: "Nigeria", value: "nigeria" },
  { name: "Ghana", value: "ghana" },
]

const DEFAULTS: BankAccountForm = {
  accountNumber: "",
  bankCode: "",
  bankName: "",
  accountName: "",
  country: "nigeria",
}

export function BankAccountFormDialog({ open, onOpenChange }: Props) {
  const { createBankAccount } = useWalletMutations()

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<BankAccountForm>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: DEFAULTS,
  })

  const selectedCountry = watch("country") as "ghana" | "kenya" | "nigeria" | "south africa"
  const accountNumber = watch("accountNumber")
  const bankCode = watch("bankCode")
  const accountName = watch("accountName")

  const {
    data: banksData,
    isLoading: isLoadingBanks,
    error: banksError,
  } = useBanks({ country: selectedCountry || "nigeria" })

  // At least 8 digits and a bank selected before we let the user verify.
  const canVerifyAccount = /^\d{8,}$/.test(accountNumber) && !!bankCode && bankCode.length > 0

  const verifyAccountMutation = useVerifyAccount((resolvedName) => {
    setValue("accountName", resolvedName)
  })

  const handleVerifyAccount = () => {
    if (canVerifyAccount) {
      verifyAccountMutation.mutate({ accountNumber, bankCode })
    }
  }

  // `getBanks` returns the API's `{ success, message, data: Bank[], meta }` shape,
  // already unwrapped once by apiRequest.
  const banksArray = Array.isArray(banksData?.data) ? banksData.data : []
  const bankOptions = banksArray.map((bank) => ({ value: bank.code, label: bank.name }))

  const closeAndReset = (state: boolean) => {
    reset(DEFAULTS)
    verifyAccountMutation.reset()
    onOpenChange(state)
  }

  const onSubmit = (values: BankAccountForm) => {
    createBankAccount.mutate(values, {
      onSuccess: () => closeAndReset(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={closeAndReset}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-left">
          <DialogTitle>Add Bank Account</DialogTitle>
          <DialogDescription>Add a new bank account for withdrawals.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={control}
            name="country"
            render={({ field }) => (
              <Field label="Country" error={errors.country?.message}>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value)
                    // Reset bank-dependent fields when the country changes.
                    setValue("bankCode", "")
                    setValue("bankName", "")
                    setValue("accountName", "")
                    verifyAccountMutation.reset()
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedCountriesList.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="bankCode"
              render={({ field }) => (
                <Field
                  label="Bank"
                  error={errors.bankCode?.message}
                  hint={banksError ? "Failed to load banks. Please try again." : undefined}
                >
                  <Select
                    value={field.value}
                    disabled={isLoadingBanks || !!banksError}
                    onValueChange={(value) => {
                      field.onChange(value)
                      const selectedBank = banksArray.find((bank) => bank.code === value)
                      if (selectedBank) {
                        setValue("bankName", selectedBank.name)
                      }
                      setValue("accountName", "")
                      verifyAccountMutation.reset()
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingBanks
                            ? "Loading banks..."
                            : banksError
                              ? "Error loading banks"
                              : "Select bank"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {bankOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Controller
              control={control}
              name="accountNumber"
              render={({ field }) => (
                <Field label="Account Number" error={errors.accountNumber?.message}>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="0123456789"
                      maxLength={10}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        if (getValues("accountName")) {
                          setValue("accountName", "")
                          verifyAccountMutation.reset()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="link"
                      onClick={handleVerifyAccount}
                      disabled={!canVerifyAccount || verifyAccountMutation.isPending}
                      className="h-9 px-2 text-xs"
                    >
                      {verifyAccountMutation.isPending ? "Verifying..." : "Verify Account"}
                    </Button>
                  </div>
                </Field>
              )}
            />
          </div>

          <Controller
            control={control}
            name="accountName"
            render={({ field }) => (
              <Field label="Account Name">
                <Input
                  placeholder={
                    verifyAccountMutation.isPending
                      ? "Resolving account..."
                      : verifyAccountMutation.error
                        ? "Failed to resolve account"
                        : "Account name will appear here"
                  }
                  disabled
                  readOnly
                  {...field}
                  className={cn(
                    verifyAccountMutation.isPending && "opacity-60",
                    verifyAccountMutation.error && "border-destructive",
                  )}
                />
                {verifyAccountMutation.isPending && (
                  <p className="text-muted-foreground text-sm">
                    Verifying account details...
                  </p>
                )}
                {verifyAccountMutation.error && (
                  <p className="text-destructive text-sm">
                    {verifyAccountMutation.error instanceof Error
                      ? verifyAccountMutation.error.message.includes("daily limit")
                        ? "Test mode limit reached. Please use test bank codes (001) or try again later."
                        : verifyAccountMutation.error.message
                      : "Failed to resolve account. Please verify the account number and bank code."}
                  </p>
                )}
                {accountName &&
                  !verifyAccountMutation.isPending &&
                  !verifyAccountMutation.error && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Account verified
                    </p>
                  )}
              </Field>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createBankAccount.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createBankAccount.isPending}>
              {createBankAccount.isPending ? "Adding..." : "Add Bank Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
