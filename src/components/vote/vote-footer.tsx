import { Link } from "@tanstack/react-router"

/** Shared trust footer for the public voting pages. */
export function VoteFooter({ organizationName }: { organizationName?: string }) {
  return (
    <footer className="border-border/60 mt-20 shrink-0 border-t">
      <div className="text-muted-foreground mx-auto flex min-h-16 max-w-5xl items-center justify-center px-5 text-center text-sm sm:min-h-14">
        <p className="inline-flex items-center gap-1.5 whitespace-nowrap">
          {organizationName ? (
            <span className="max-w-40 truncate sm:max-w-56">{organizationName} ·</span>
          ) : null}
          <Link
            to="/welcome"
            className="hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
          >
            Powered by
            <img
              src="/sportly-logo.png"
              alt="Sportly"
              width={599}
              height={201}
              className="h-4 w-auto"
            />
          </Link>
        </p>
      </div>
    </footer>
  )
}
