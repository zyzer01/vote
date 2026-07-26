import { motion } from "motion/react"
import { TrendingUp } from "lucide-react"
import { CountingNumber } from "@/components/animate-ui/primitives/texts/counting-number"
import { Reveal, SectionHeading } from "./primitives"
import { cn } from "@/lib/utils"

const RESULTS = [
  { name: "Kelechi Okafor", team: "Enyimba FC", votes: 128400, pct: 100, img: "/avatars/1.svg" },
  { name: "Thabo Botha", team: "Sundowns", votes: 93120, pct: 73, img: "/avatars/4.svg" },
  { name: "Zainab Ndiaye", team: "AS Douanes", votes: 61240, pct: 48, img: "/avatars/3.svg" },
  { name: "Chidi Nwosu", team: "Rivers United", votes: 40880, pct: 32, img: "/avatars/6.svg" },
]

const FEED = [
  { who: "Fatima", n: 50 },
  { who: "David", n: 10 },
  { who: "Lerato", n: 100 },
  { who: "Kwame", n: 25 },
]

const PAYMENTS = ["TagPay", "Visa", "Mastercard", "Verve", "Bank transfer"]

export function Showcase() {
  return (
    <section
      id="showcase"
      className="relative isolate overflow-hidden px-4 py-24 md:py-32"
    >
      {/* soft, airy backdrop -a light band, not a dark hero */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background via-muted/40 to-background" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,oklch(0.6907_0.1828_151.72/0.09),transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="See it live"
          title={
            <>
              Watch a campaign come{" "}
              <span className="text-gray-400">alive</span>
            </>
          }
          description="Every vote updates the leaderboard instantly. This is exactly what your fans see - polished, fast and impossible to fake."
        />

        <Reveal className="mt-14">
          {/* the live campaign page, framed like the real product */}
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {/* branded top bar */}
            <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2.5">
                <img
                  src="/sportly-mark.png"
                  alt=""
                  aria-hidden
                  width={22}
                  height={22}
                  draggable={false}
                  className="size-5 -rotate-12"
                />
                <div className="leading-tight">
                  <p className="text-sm font-semibold tracking-tight">Sportly Awards 2026</p>
                  <p className="hidden text-[0.7rem] text-muted-foreground sm:block">
                    vote.sportly.africa/awards-2026
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[0.7rem] font-semibold text-primary">
                <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                Live
              </span>
            </div>

            {/* body */}
            <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1.6fr_1fr]">
              {/* leaderboard */}
              <div className="rounded-xl border border-border bg-background p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 ring-inset">
                    <TrendingUp className="size-5" />
                  </span>
                  <div className="leading-tight">
                    <p className="font-semibold">Player of the Season</p>
                    <p className="text-xs text-muted-foreground">Most votes wins the trophy</p>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5">
                  {RESULTS.map((r, i) => (
                    <div
                      key={r.name}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-2 py-2 transition-colors",
                        i === 0 && "bg-primary/[0.06]",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          i === 0
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {i + 1}
                      </span>
                      <img
                        src={r.img}
                        alt=""
                        className="size-9 rounded-full ring-2 ring-border"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate text-sm font-medium">{r.name}</p>
                          <p className="text-sm font-semibold tabular-nums text-primary">
                            <CountingNumber number={r.votes} inView />
                          </p>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${r.pct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.1, delay: 0.2 + i * 0.12, ease: "easeOut" }}
                            className={cn(
                              "h-full rounded-full",
                              i === 0 ? "bg-primary" : "bg-primary/35",
                            )}
                          />
                        </div>
                      </div>
                      <p className="hidden w-24 truncate text-right text-xs text-muted-foreground sm:block">
                        {r.team}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* live feed */}
              <div className="flex flex-col rounded-xl border border-border bg-background p-5">
                <p className="text-sm font-semibold">Live vote feed</p>
                <div className="mt-4 flex-1 space-y-2.5">
                  {FEED.map((f, i) => (
                    <motion.div
                      key={f.who}
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.15 }}
                      className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-2.5"
                    >
                      <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {f.who[0]}
                      </span>
                      <p className="flex-1 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{f.who}</span> cast{" "}
                        <span className="font-semibold text-primary">{f.n} votes</span>
                      </p>
                      <span className="text-[0.65rem] text-muted-foreground/70">now</span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl bg-muted p-4 text-center ring-1 ring-primary/15 ring-inset">
                  <p className="text-2xl font-bold tabular-nums">
                    <CountingNumber number={323640} inView />
                  </p>
                  <p className="text-xs text-muted-foreground">total votes cast today</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* payment strip */}
        <Reveal delay={0.15} className="mt-12">
          <div className="flex flex-col items-center gap-4">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Accepts every way your fans want to pay
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {PAYMENTS.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-border bg-muted/40 px-4 py-2 text-sm font-medium text-muted-foreground"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
