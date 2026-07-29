import { useEffect } from "react"
import { useNavigate, useRouterState } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"

import { ApiError } from "@/lib/api/client"
import { myWorkspacesQuery, sessionQuery } from "@/lib/api/admin-queries"
import { AuthProvider } from "@/lib/auth"
import { GlobalLoader } from "@/components/ui/global-loader"
import { CreateWorkspace } from "@/components/admin/create-workspace"

/**
 * Client-side auth gate for the dashboard. The API authenticates with an
 * httpOnly `vote` cookie, so we can't resolve the session during SSR -this
 * guard runs on the client, redirects to /login on 401, and provides the
 * resolved user + active workspace to the shell.
 *
 * There are only two outcomes, and both move the user forward: a workspace
 * means the dashboard, no workspace means an offer to create one. Vote never
 * refuses a signed-in Sportly account.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const session = useQuery(sessionQuery())
  const workspaces = useQuery(myWorkspacesQuery())

  const isUnauthorized =
    (session.error instanceof ApiError && session.error.isUnauthorized) ||
    (workspaces.error instanceof ApiError && workspaces.error.isUnauthorized)

  useEffect(() => {
    if (isUnauthorized) {
      navigate({ to: "/login", search: { redirect: pathname }, replace: true })
    }
  }, [isUnauthorized, navigate, pathname])

  const user = session.data?.user
  const workspace = workspaces.data?.[0]

  if (session.isLoading || workspaces.isLoading || isUnauthorized) {
    return <GlobalLoader />
  }

  if (session.error || workspaces.error) {
    return <AuthError onRetry={() => window.location.reload()} />
  }

  if (!user) {
    return <GlobalLoader />
  }

  if (!workspace) {
    return <CreateWorkspace email={user.email} />
  }

  return (
    <AuthProvider
      value={{
        user,
        voteOrganizationId: workspace.id,
        voteOrganizationName: workspace.name,
        role: workspace.role,
      }}
    >
      {children}
    </AuthProvider>
  )
}

function AuthError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid min-h-svh place-items-center px-5">
      <div className="max-w-sm text-center">
        <h1 className="font-heading text-xl font-bold">
          We couldn't load your dashboard
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Please check your connection and try again.
        </p>
        <button
          onClick={onRetry}
          className="text-primary mt-4 text-sm font-semibold hover:underline"
        >
          Retry
        </button>
      </div>
    </div>
  )
}
