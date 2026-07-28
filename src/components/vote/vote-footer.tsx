import { ShieldCheck } from "lucide-react"

/** Shared trust footer for the public voting pages. */
export function VoteFooter({ organizationName }: { organizationName?: string }) {
  return (
    <footer className="border-border/60 mt-20 shrink-0 border-t">
      <div className="text-muted-foreground mx-auto flex min-h-24 max-w-5xl flex-col items-center justify-center gap-3 px-5 text-center text-sm sm:min-h-20 sm:flex-row sm:justify-between sm:text-left">
        <p className="inline-flex items-center gap-2">
          <ShieldCheck className="text-brand-green size-4" />
          Secure payments · Every vote counted once
        </p>
        <p className="inline-flex items-center gap-1.5 whitespace-nowrap">
          {organizationName ? (
            <span className="max-w-40 truncate sm:max-w-56">{organizationName} ·</span>
          ) : null}
          Powered by
          <img
            src="/sportly-logo.png"
            alt="Sportly"
            width={599}
            height={201}
            className="h-4 w-auto"
          />
        </p>
      </div>
    </footer>
  )
}
