import { AlertTriangle, RefreshCw } from "lucide-react"

import { ApiError } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

/** Full-page error fallback for the public voting routes. */
export function RouteError({ error }: { error: unknown }) {
  const message =
    error instanceof ApiError
      ? error.status === 0
        ? "We can't reach the server right now. Please check your connection and try again."
        : error.message
      : "Something went wrong while loading this page."

  return (
    <main className="grid min-h-svh place-items-center px-5">
      <div className="max-w-md text-center">
        <div className="bg-destructive/10 text-destructive mx-auto grid size-14 place-items-center rounded-2xl">
          <AlertTriangle className="size-7" />
        </div>
        <h1 className="font-heading mt-5 text-2xl font-bold">
          We hit a snag
        </h1>
        <p className="text-muted-foreground mt-2">{message}</p>
        <Button
          className="mt-6"
          size="lg"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="size-4" />
          Try again
        </Button>
      </div>
    </main>
  )
}

/** Skeleton shown while a campaign page's data resolves. */
export function CampaignPending() {
  return (
    <div className="min-h-svh">
      <div className="bg-brand-navy flex flex-col items-center gap-5 px-5 pt-24 pb-20">
        <Skeleton className="h-6 w-40 rounded-full bg-white/10" />
        <Skeleton className="h-12 w-80 max-w-full rounded-xl bg-white/10" />
        <Skeleton className="h-5 w-96 max-w-full rounded-lg bg-white/10" />
        <div className="mt-4 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="size-14 rounded-xl bg-white/10" />
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-5 pt-10">
        <Skeleton className="h-8 w-56" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
