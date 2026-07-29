import { WithdrawalsTable } from "./components/withdrawals-table"
import { WithdrawalsPrimaryButtons } from "./components/withdrawals-primary-buttons"
import { WithdrawalsDialogs } from "./components/withdrawals-dialogs"
import { WithdrawalsProvider } from "./context/withdrawals-context"

export function Withdrawals() {
  return (
    <WithdrawalsProvider>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Withdrawals</h2>
          <p className="text-muted-foreground">View and manage your withdrawal requests</p>
        </div>
        <WithdrawalsPrimaryButtons />
      </div>

      <WithdrawalsTable />

      <WithdrawalsDialogs />
    </WithdrawalsProvider>
  )
}
