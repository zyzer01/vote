import { Button } from "@/components/ui/button"
import { useWalletContext } from "../context/wallet-context"
import { Wallet, Plus } from "lucide-react"

export function WalletPrimaryButtons() {
  const { setIsWithdrawDialogOpen, setIsAddBankAccountOpen } = useWalletContext()

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={() => setIsWithdrawDialogOpen(true)}
        className="flex items-center gap-2"
      >
        <Wallet className="h-4 w-4" />
        <span className="inline">Withdraw Funds</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsAddBankAccountOpen(true)}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        <span className="inline">Add Bank Account</span>
      </Button>
    </div>
  )
}
