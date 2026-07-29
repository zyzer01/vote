import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useBankAccounts } from "../hooks/use-bank-accounts"
import { useWalletMutations } from "../hooks/use-wallet-mutations"
import { getBankAccountStatusVariant } from "../utils/status-helpers"
import { getBankAccountStatusLabel } from "../utils/wallet-helpers"
import { Trash2, Star, RefreshCw } from "lucide-react"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BankAccountsListDialog({ open, onOpenChange }: Props) {
  const { data: bankAccountsData, isLoading } = useBankAccounts()
  const { setPrimaryBankAccount, deleteBankAccount } = useWalletMutations()

  const bankAccounts = bankAccountsData || []

  const handleSetPrimary = (accountId: string) => {
    setPrimaryBankAccount.mutate(accountId)
  }

  const handleDelete = (accountId: string) => {
    if (confirm("Are you sure you want to delete this bank account?")) {
      deleteBankAccount.mutate(accountId)
    }
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bank Accounts</DialogTitle>
            <DialogDescription>Manage your bank accounts for withdrawals</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              ></div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bank Accounts</DialogTitle>
          <DialogDescription>
            Manage your bank accounts for withdrawals. Only verified accounts can be used.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-96 space-y-4 overflow-y-auto">
          {bankAccounts.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No bank accounts found</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Add a bank account to enable withdrawals
              </p>
            </div>
          ) : (
            bankAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h4 className="font-medium">{account.accountName}</h4>
                    <Badge
                      variant={getBankAccountStatusVariant(account.status)}
                      className="capitalize"
                    >
                      {getBankAccountStatusLabel(account.status)}
                    </Badge>
                    {account.isVerified && (
                      <Badge variant="outline" className="border-green-600 text-green-600">
                        <Star className="mr-1 h-3 w-3" />
                        Primary
                      </Badge>
                    )}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    <p>Account: {account.accountNumber}</p>
                    <p>Bank: {account.bankName}</p>
                    <p>Added: {new Date(account.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {account.status === "PENDING" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.reload()}
                    >
                      <RefreshCw className="mr-1 h-4 w-4" />
                      Refresh
                    </Button>
                  )}

                  {account.status === "VERIFIED" && !account.isVerified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetPrimary(account.id)}
                      disabled={setPrimaryBankAccount.isPending}
                    >
                      Set Primary
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(account.id)}
                    disabled={deleteBankAccount.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
