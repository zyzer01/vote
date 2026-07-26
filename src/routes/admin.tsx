import { Outlet, createFileRoute } from "@tanstack/react-router"

import { RequireAuth } from "@/components/admin/require-auth"
import { DashboardShell } from "@/components/admin/dashboard-shell"

export const Route = createFileRoute("/admin")({
  // The dashboard authenticates with an httpOnly cookie the SSR server can't
  // read, so render the whole admin subtree on the client. This also stops
  // route loaders from firing (and 401-ing) during SSR.
  ssr: false,
  head: () => ({
    meta: [{ title: "Dashboard -Sportly Vote" }],
  }),
  component: AdminLayout,
})

function AdminLayout() {
  return (
    <RequireAuth>
      <DashboardShell>
        <Outlet />
      </DashboardShell>
    </RequireAuth>
  )
}
