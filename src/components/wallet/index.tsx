import { WalletSummaryCards } from "./components/wallet-summary-cards"
import { WalletBalanceHistoryChart } from "./components/wallet-balance-history-chart"
import { TransactionsTable } from "./components/transactions-table"
import { useAuth } from "@/lib/auth"
import { WalletPrimaryButtons } from "./components/wallet-primary-buttons"
import { WalletDialogs } from "./components/wallet-dialogs"
import { WalletProvider } from "./context/wallet-context"

export function Wallet() {
  const { voteOrganizationId } = useAuth()

  return (
    <WalletProvider>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Wallet</h2>
          <p className="text-muted-foreground">
            Manage your workspace's wallet, transactions, and withdrawals
          </p>
        </div>
        <WalletPrimaryButtons />
      </div>

      {/* Balance chart + summary (desktop: 3/5 + 2/5) */}
      <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-6">
        <div className="w-full min-w-0 lg:w-3/5 lg:shrink-0">
          {voteOrganizationId ? (
            <WalletBalanceHistoryChart voteOrganizationId={voteOrganizationId} />
          ) : (
            <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
              Sign in with a workspace to view balance history.
            </div>
          )}
        </div>
        <div className="w-full min-w-0 lg:w-2/5">
          <WalletSummaryCards sidePanel />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
        <TransactionsTable />
      </div>

      <WalletDialogs />
    </WalletProvider>
  )
}
