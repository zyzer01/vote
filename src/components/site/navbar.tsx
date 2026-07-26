import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Menu, X } from "lucide-react"
import { Logo } from "./logo"
import { cn } from "@/lib/utils"

const NAV = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Live results", href: "#showcase" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4">
      <motion.nav
        initial={false}
        animate={{
          width: scrolled ? "min(72rem, 100%)" : "min(80rem, 100%)",
          marginTop: scrolled ? 12 : 20,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
        className={cn(
          "flex items-center justify-between rounded-full px-4 py-2.5 sm:px-6",
          scrolled
            ? "border border-border/70 bg-background/80 shadow-[0_8px_30px_-12px_rgba(0,11,68,0.25)] backdrop-blur-xl"
            : "border border-transparent",
        )}
      >
        <a href="#top" className="flex items-center">
          <Logo />
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground"
          >
            Log in
          </a>
          <a
            href="/signup"
            className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            Start a campaign
          </a>
        </div>

        <button
          className="flex size-9 items-center justify-center rounded-full text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-20 left-4 right-4 z-50 overflow-hidden rounded-3xl border border-border bg-background/95 p-3 shadow-xl backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-foreground hover:bg-muted"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2 px-1">
                <a
                  href="/login"
                  className="rounded-lg border border-border px-4 py-2.5 text-center text-sm font-semibold"
                >
                  Log in
                </a>
                <a
                  href="/signup"
                  className="rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground"
                >
                  Start
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
