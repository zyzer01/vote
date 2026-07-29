import { useWalletContext } from "../context/wallet-context"
import { BankAccountFormDialog } from "./bank-account-form-dialog"
import { BankAccountsListDialog } from "./bank-accounts-list-dialog"
import { WithdrawalFormDialog } from "@/components/withdrawals/components/withdrawal-form-dialog"

export function WalletDialogs() {
  const {
    isAddBankAccountOpen,
    setIsAddBankAccountOpen,
    isBankAccountsListOpen,
    setIsBankAccountsListOpen,
    isWithdrawDialogOpen,
    setIsWithdrawDialogOpen,
  } = useWalletContext()

  return (
    <>
      <BankAccountFormDialog open={isAddBankAccountOpen} onOpenChange={setIsAddBankAccountOpen} />
      <BankAccountsListDialog
        open={isBankAccountsListOpen}
        onOpenChange={setIsBankAccountsListOpen}
      />
      <WithdrawalFormDialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen} />
    </>
  )
}
