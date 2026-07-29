import { useWithdrawalsContext } from "../context/withdrawals-context"
import { WithdrawalFormDialog } from "./withdrawal-form-dialog"
import { WithdrawalDetailsDialog } from "./withdrawal-details-dialog"

export function WithdrawalsDialogs() {
  const {
    isWithdrawDialogOpen,
    setIsWithdrawDialogOpen,
    isWithdrawalDetailsOpen,
    setIsWithdrawalDetailsOpen,
  } = useWithdrawalsContext()

  return (
    <>
      <WithdrawalFormDialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen} />

      <WithdrawalDetailsDialog
        open={isWithdrawalDetailsOpen}
        onOpenChange={setIsWithdrawalDetailsOpen}
      />
    </>
  )
}
