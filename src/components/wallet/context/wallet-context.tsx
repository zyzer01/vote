import { createContext, useContext, useState, type ReactNode } from "react"
import type { BankAccountVerificationStatus } from "../interfaces/bank-account"

interface WalletContextType {
  // Dialog states
  isAddBankAccountOpen: boolean
  setIsAddBankAccountOpen: (open: boolean) => void
  isBankAccountsListOpen: boolean
  setIsBankAccountsListOpen: (open: boolean) => void
  isWithdrawDialogOpen: boolean
  setIsWithdrawDialogOpen: (open: boolean) => void

  // Selected data
  selectedBankAccount: BankAccountVerificationStatus | null
  setSelectedBankAccount: (account: BankAccountVerificationStatus | null) => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isAddBankAccountOpen, setIsAddBankAccountOpen] = useState(false)
  const [isBankAccountsListOpen, setIsBankAccountsListOpen] = useState(false)
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)
  const [selectedBankAccount, setSelectedBankAccount] =
    useState<BankAccountVerificationStatus | null>(null)

  const value: WalletContextType = {
    isAddBankAccountOpen,
    setIsAddBankAccountOpen,
    isBankAccountsListOpen,
    setIsBankAccountsListOpen,
    isWithdrawDialogOpen,
    setIsWithdrawDialogOpen,
    selectedBankAccount,
    setSelectedBankAccount,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWalletContext() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWalletContext must be used within a WalletProvider")
  }
  return context
}
