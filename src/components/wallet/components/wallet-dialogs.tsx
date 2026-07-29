import { useWalletContext } from "../context/wallet-context"
import { BankAccountFormDialog } from "./bank-account-form-dialog"
import { BankAccountsListDialog } from "./bank-accounts-list-dialog"

export function WalletDialogs() {
  const {
    isAddBankAccountOpen,
    setIsAddBankAccountOpen,
    isBankAccountsListOpen,
    setIsBankAccountsListOpen,
  } = useWalletContext()

  return (
    <>
      <BankAccountFormDialog open={isAddBankAccountOpen} onOpenChange={setIsAddBankAccountOpen} />

      <BankAccountsListDialog
        open={isBankAccountsListOpen}
        onOpenChange={setIsBankAccountsListOpen}
      />
    </>
  )
}
