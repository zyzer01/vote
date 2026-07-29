import { Navigate, Outlet, createFileRoute } from "@tanstack/react-router"

import { canViewRevenue, useAuth } from "@/lib/auth"

export const Route = createFileRoute("/admin/wallet")({
  component: WalletLayout,
})

function WalletLayout() {
  const { role } = useAuth()

  if (!canViewRevenue(role)) {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}
