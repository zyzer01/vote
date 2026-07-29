import { Button } from "@/components/ui/button"
import { useWithdrawalsContext } from "../context/withdrawals-context"
import { Plus } from "lucide-react"

export function WithdrawalsPrimaryButtons() {
  const { setIsWithdrawDialogOpen } = useWithdrawalsContext()

  return (
    <Button onClick={() => setIsWithdrawDialogOpen(true)} className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      <span className="hidden md:inline">Initiate Withdrawal</span>
    </Button>
  )
}
