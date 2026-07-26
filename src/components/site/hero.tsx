import { motion } from "motion/react"
import { ArrowRight, Play, Sparkles } from "lucide-react"
import { FlipWords } from "@/components/ui/flip-words"

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden px-4 pt-36 pb-20 sm:pt-40 md:pb-28"
    >
      {/* backdrop */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* soft warm wash that melts into the page below */}
        <div className="absolute inset-0 bg-[oklch(0.977_0.006_88)] [mask-image:linear-gradient(to_bottom,#000_68%,transparent_100%)]" />
        {/* fine ruled grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.42_0.02_140/0.055)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.42_0.02_140/0.055)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_82%_72%_at_50%_4%,#000_58%,transparent_100%)] bg-[size:54px_54px]" />
        {/* soft brand glows -warm tones lead */}
        <div className="absolute top-[-10%] left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-primary/4 blur-[130px]" />
        <div className="absolute top-[30%] right-[12%] h-80 w-80 rounded-full bg-brand-yellow/16 blur-[110px]" />
        <div className="absolute top-[40%] left-[8%] h-80 w-80 rounded-full bg-brand-red/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <motion.a
          href="#showcase"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="group inline-flex items-center gap-2 rounded-full border border-border bg-background/70 py-1.5 pr-4 pl-1.5 text-sm font-medium backdrop-blur"
        >
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
            <Sparkles className="size-3" /> New
          </span>
          <span className="text-muted-foreground">
            Live for the 2026 awards season
          </span>
          <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </motion.a>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mt-7 font-heading text-4xl leading-[1.22] font-bold tracking-tight sm:text-6xl md:text-7xl md:leading-[1.05]"
        >
          One platform to
          <br className="sm:hidden" />
          {" run"}
          <br className="hidden sm:block" />
          {" world-class "}
          <br className="sm:hidden" />
          <span className="relative inline-block text-primary">
            <FlipWords
              words={["awards", "fan votes", "MVP races", "talent hunts"]}
              className="!text-primary"
            />
            <svg
              className="absolute -bottom-2 left-0 w-full text-primary/40"
              viewBox="0 0 300 12"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M2 9C60 3 120 3 180 6C230 8 270 8 298 4"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-7 max-w-2xl text-base leading-relaxed text-balance text-gray-900 md:text-lg"
        >
          Launch branded voting campaigns in minutes. Collect paid and free
          votes, watch a live leaderboard, and get settled straight to your
          wallet.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
        >
          <a
            href="/signup"
            className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 sm:w-auto sm:px-7 sm:py-3.5"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            Start a campaign
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#showcase"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted sm:w-auto sm:px-6 sm:py-3.5"
          >
            <Play className="size-4 fill-primary text-primary" />
            See a live campaign
          </a>
        </motion.div>
      </div>
    </section>
  )
}
