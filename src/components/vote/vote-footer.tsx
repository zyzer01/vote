import { ShieldCheck } from "lucide-react"

/** Shared trust footer for the public voting pages. */
export function VoteFooter({ organizationName }: { organizationName?: string }) {
  return (
    <footer className="border-border/60 mt-20 border-t">
      <div className="text-muted-foreground mx-auto flex max-w-5xl flex-col items-center gap-3 px-5 py-10 text-center text-sm sm:flex-row sm:justify-between sm:text-left">
        <p className="inline-flex items-center gap-2">
          <ShieldCheck className="text-brand-green size-4" />
          Secure payments · Every vote counted once
        </p>
        <p>
          {organizationName ? `${organizationName} · ` : ""}Powered by{" "}
          <span className="text-foreground font-semibold">Sportly</span>
        </p>
      </div>
    </footer>
  )
}
