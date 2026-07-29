import { createContext, useContext, useState, type ReactNode } from "react"
import type { WithdrawalStatus } from "../interfaces/withdrawal"

interface WithdrawalsContextType {
  // Dialog states
  isWithdrawDialogOpen: boolean
  setIsWithdrawDialogOpen: (open: boolean) => void
  isWithdrawalDetailsOpen: boolean
  setIsWithdrawalDetailsOpen: (open: boolean) => void

  // Selected data
  selectedWithdrawal: WithdrawalStatus | null
  setSelectedWithdrawal: (withdrawal: WithdrawalStatus | null) => void
}

const WithdrawalsContext = createContext<WithdrawalsContextType | undefined>(undefined)

export function WithdrawalsProvider({ children }: { children: ReactNode }) {
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)
  const [isWithdrawalDetailsOpen, setIsWithdrawalDetailsOpen] = useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalStatus | null>(null)

  const value: WithdrawalsContextType = {
    isWithdrawDialogOpen,
    setIsWithdrawDialogOpen,
    isWithdrawalDetailsOpen,
    setIsWithdrawalDetailsOpen,
    selectedWithdrawal,
    setSelectedWithdrawal,
  }

  return (
    <WithdrawalsContext.Provider value={value}>{children}</WithdrawalsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWithdrawalsContext() {
  const context = useContext(WithdrawalsContext)
  if (context === undefined) {
    throw new Error("useWithdrawalsContext must be used within a WithdrawalsProvider")
  }
  return context
}
