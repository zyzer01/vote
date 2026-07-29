import { useEffect } from "react"
import { Link, useNavigate, useRouterState } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"

import { ApiError } from "@/lib/api/client"
import {
  accessQuery,
  organizationQuery,
  sessionQuery,
} from "@/lib/api/admin-queries"
import { AuthProvider } from "@/lib/auth"
import { Logo } from "@/components/site/logo"
import { Spinner } from "@/components/ui/spinner"

/**
 * Client-side auth gate for the dashboard. The API authenticates with an
 * httpOnly `vote` cookie, so we can't resolve the session during SSR -this
 * guard runs on the client, redirects to /login on 401, and provides the
 * resolved user + active organization to the shell.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const session = useQuery(sessionQuery())
  const access = useQuery(accessQuery())

  const isUnauthorized =
    (session.error instanceof ApiError && session.error.isUnauthorized) ||
    (access.error instanceof ApiError && access.error.isUnauthorized)

  useEffect(() => {
    if (isUnauthorized) {
      navigate({ to: "/login", search: { redirect: pathname }, replace: true })
    }
  }, [isUnauthorized, navigate, pathname])

  const user = session.data?.user
  const organizationId =
    access.data?.grants.find(
      (g) => g.scopeType === "ORGANIZATION" && g.role === "OWNER",
    )?.organizationId ?? null

  const org = useQuery({
    ...organizationQuery(organizationId ?? ""),
    enabled: Boolean(organizationId),
  })

  if (session.isLoading || access.isLoading || isUnauthorized) {
    return <AuthSplash />
  }

  if (session.error || access.error) {
    return <AuthError onRetry={() => window.location.reload()} />
  }

  if (!user || !organizationId) {
    return <NoOrganization email={user?.email} />
  }

  return (
    <AuthProvider
      value={{
        user,
        organizationId,
        organizationName: org.data?.name ?? "Your workspace",
      }}
    >
      {children}
    </AuthProvider>
  )
}

function AuthSplash() {
  return (
    <div className="grid min-h-svh place-items-center">
      <div className="flex flex-col items-center gap-4">
        <Logo showWordmark={false} className="animate-pulse" />
        <Spinner className="text-muted-foreground size-5" />
      </div>
    </div>
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

function NoOrganization({ email }: { email?: string }) {
  return (
    <div className="grid min-h-svh place-items-center px-5">
      <div className="max-w-md text-center">
        <h1 className="font-heading text-xl font-bold">No organization yet</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {email ? `${email} isn't` : "This account isn't"} linked to an
          organization that can run voting campaigns. Ask an owner to invite
          you, or{" "}
          <Link
            to="/signup"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            create one
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
