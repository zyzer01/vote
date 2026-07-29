import { useState } from "react"
import { Link, useNavigate, useRouterState } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import {
  ChevronDown,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Trophy,
} from "lucide-react"

import { signout } from "@/lib/api/admin"
import { fullName, initials, useAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/site/logo"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const NAV = [
  { to: "/admin", label: "Campaigns", icon: LayoutDashboard, exact: true },
] as const

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="bg-muted/30 min-h-svh lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="bg-sidebar border-sidebar-border sticky top-0 hidden h-svh flex-col border-r lg:flex">
        <SidebarBody />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="bg-sidebar absolute inset-y-0 left-0 flex w-72 flex-col shadow-xl">
            <SidebarBody onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-col">
        <Topbar onOpenMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { voteOrganizationName } = useAuth()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <>
      <div className="border-sidebar-border flex h-16 items-center border-b px-5">
        <Logo />
      </div>

      <div className="px-4 py-4">
        <div className="bg-sidebar-accent/60 flex items-center gap-2.5 rounded-xl px-3 py-2.5">
          <div className="bg-primary/15 text-primary grid size-8 shrink-0 place-items-center rounded-lg">
            <Trophy className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sidebar-foreground truncate text-sm font-semibold">
              {voteOrganizationName}
            </p>
            <p className="text-muted-foreground text-xs">Voting workspace</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.to
            : pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary/12 text-sidebar-primary"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="size-4.5" />
              {item.label}
            </Link>
          )
        })}

        <Link
          to="/admin/campaigns/new"
          onClick={onNavigate}
          className="mt-2"
        >
          <Button className="w-full font-semibold" size="sm">
            <Plus className="size-4" />
            New campaign
          </Button>
        </Link>
      </nav>

      <div className="border-sidebar-border mt-auto border-t p-4">
        <a
          href="/welcome"
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground hover:text-sidebar-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
        >
          About Sportly Vote
          <ExternalLink className="ml-auto size-3" />
        </a>
      </div>
    </>
  )
}

function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignout() {
    setSigningOut(true)
    try {
      await signout()
    } catch {
      // Even if the call fails, clear local state and bounce to login.
    }
    queryClient.clear()
    navigate({ to: "/login" })
  }

  return (
    <header className="bg-background/80 border-border/60 sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-5 backdrop-blur-lg lg:px-8">
      <button
        onClick={onOpenMenu}
        className="hover:bg-muted -ml-1 grid size-9 place-items-center rounded-lg lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="lg:hidden">
        <Logo showWordmark={false} />
      </div>

      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="hover:bg-muted flex items-center gap-2.5 rounded-full py-1 pr-2 pl-1 transition-colors">
                <span className="bg-primary/15 text-primary grid size-8 place-items-center rounded-full text-sm font-semibold">
                  {initials(user)}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-sm leading-tight font-medium">
                    {fullName(user)}
                  </span>
                </span>
                <ChevronDown className="text-muted-foreground size-4" />
              </button>
            }
          />
          <DropdownMenuContent>
            <div className="px-2.5 py-2">
              <p className="text-sm font-medium">{fullName(user)}</p>
              <p className="text-muted-foreground truncate text-xs">
                {user.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={handleSignout}
              disabled={signingOut}
            >
              <LogOut />
              {signingOut ? "Signing out…" : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
