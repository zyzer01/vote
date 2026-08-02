import {
  BarChart3,
  CreditCard,
  Crown,
  ShieldCheck,
  Trophy,
  Wallet,
} from "lucide-react"
import { CountingNumber } from "@/components/animate-ui/primitives/texts/counting-number"
import { Reveal, SectionHeading, revealStyle } from "./primitives"
import { cn } from "@/lib/utils"

/** A meter that grows from 0 when it scrolls into view. */
function Bar({
  size,
  delay,
  className,
  axis = "x",
}: {
  /** Final length, as a CSS length - the bar scales up to it. */
  size: string
  delay?: number
  className?: string
  axis?: "x" | "y"
}) {
  return (
    <div
      data-reveal=""
      style={revealStyle(delay, axis === "x" ? { width: size } : { height: size })}
      className={cn(axis === "x" ? "reveal-grow-x" : "reveal-grow-y", className)}
    />
  )
}

/* ------------------------------- mock visuals ------------------------------ */

const BARS = [42, 58, 35, 70, 48, 100, 62, 38, 80, 52, 44, 66]

function DashboardMock() {
  return (
    <div className="rounded-xl border border-border/80 bg-background p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/12 text-primary-foreground">
            <Trophy className="size-4" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Sportly Awards 2026</p>
            <p className="text-[0.7rem] text-muted-foreground">
              Player of the Season
            </p>
          </div>
        </div>
        <div className="flex -space-x-2">
          {[1, 2, 3].map((n) => (
            <img
              key={n}
              src={`/avatars/${n}.svg`}
              alt=""
              width={24}
              height={24}
              loading="lazy"
              decoding="async"
              className="size-6 rounded-full ring-2 ring-background"
            />
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight">
          ₦
          <CountingNumber number={4.28} decimalPlaces={2} inView />M
        </span>
        <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[0.7rem] font-semibold text-primary-foreground">
          +18.2%
        </span>
        <span className="text-[0.7rem] text-muted-foreground">this week</span>
      </div>

      <div className="mt-4 flex h-28 items-end gap-1.5">
        {BARS.map((h, i) => (
          <Bar
            key={i}
            axis="y"
            size={`${h}%`}
            delay={i * 0.04}
            className={cn(
              "flex-1 rounded-t-sm",
              h === 100 ? "bg-primary" : "bg-primary/15",
            )}
          />
        ))}
      </div>
    </div>
  )
}

const LEADERS = [
  { name: "Amara Okafor", votes: 12840, pct: 100, img: "/avatars/amara.jpg" },
  { name: "Kola Balogun", votes: 9310, pct: 72, img: "/avatars/thabo.jpg" },
  { name: "Zainab Ndiaye", votes: 6120, pct: 48, img: "/avatars/zainab.jpg" },
]

function LeaderboardMock() {
  return (
    <div className="space-y-2.5">
      {LEADERS.map((l, i) => (
        <div
          key={l.name}
          className="rounded-xl border border-border/70 bg-background p-2.5"
        >
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold",
                i === 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {i + 1}
            </span>
            <img
              src={l.img}
              alt=""
              width={24}
              height={24}
              loading="lazy"
              decoding="async"
              className="size-6 rounded-full object-cover"
            />
            <span className="flex-1 truncate text-xs font-medium">{l.name}</span>
            <span className="text-xs font-semibold tabular-nums">
              <CountingNumber number={l.votes} inView />
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <Bar
              size={`${l.pct}%`}
              delay={0.15 + i * 0.08}
              className={cn(
                "h-full rounded-full",
                i === 0 ? "bg-primary" : "bg-primary/40",
              )}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function VoteCardMock() {
  return (
    <div className="rounded-xl border border-border/80 bg-background p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <img
          src="/avatars/chidi-nwosu.png"
          alt=""
          width={44}
          height={44}
          loading="lazy"
          decoding="async"
          className="size-11 rounded-xl object-cover"
        />
        <div className="leading-tight">
          <p className="text-sm font-semibold">Chidi Nwosu</p>
          <p className="text-xs text-muted-foreground">Rising Star of the Year</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/70 p-2.5">
        <span className="text-xs text-muted-foreground">Votes</span>
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md border border-border bg-background text-sm">
            −
          </span>
          <span className="w-6 text-center text-sm font-semibold">10</span>
          <span className="flex size-6 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">
            +
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">₦100 / vote</span>
        <span className="text-sm font-bold">₦1,000</span>
      </div>
      <button className="mt-3 w-full rounded-lg bg-primary py-2.5 text-xs font-semibold text-primary-foreground">
        Vote now
      </button>
      <p className="mt-2 text-center text-[0.7rem] text-muted-foreground">
        1 free vote available today
      </p>
    </div>
  )
}

/* --------------------------------- card ----------------------------------- */

function FeatureCard({
  icon,
  title,
  description,
  children,
  className,
  delay = 0,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children?: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <Reveal
      delay={delay}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card p-6 shadow-[0_1px_2px_rgba(0,11,68,0.04)]",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          {icon}
        </span>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      </div>
      <p className="mb-5 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {children && <div className="mt-auto">{children}</div>}
    </Reveal>
  )
}

export function Features() {
  return (
    <section id="features" className="relative px-4 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Everything you need"
          title={
            <>
              One toolkit for the entire{" "}
              <span className="text-gray-400">voting lifecycle</span>
            </>
          }
          description="From building the ballot to settling revenue, Sportly Vote handles the busywork so you can focus on the moment that matters - crowning a winner."
        />

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">
          <FeatureCard
            className="md:col-span-2"
            icon={<BarChart3 className="size-5" />}
            title="A dashboard that runs the whole event"
            description="Track revenue, votes and turnout in real time. Every category, every nominee, every naira -in one live control room built for organizers."
          >
            <DashboardMock />
          </FeatureCard>

          <FeatureCard
            icon={<CreditCard className="size-5" />}
            title="Paid & free votes"
            description="Charge per vote, offer free daily votes, or run a hybrid campaign. You set the price and the rules."
            delay={0.05}
          >
            <VoteCardMock />
          </FeatureCard>

          <FeatureCard
            icon={<Crown className="size-5" />}
            title="Live leaderboards"
            description="A results page that updates as votes land -build hype and keep fans coming back to check the standings."
            delay={0.1}
          >
            <LeaderboardMock />
          </FeatureCard>

          <FeatureCard
            icon={<Wallet className="size-5" />}
            title="Instant wallet settlement"
            description="Revenue is credited to your organization wallet the moment a payment clears, ready to withdraw."
            delay={0.15}
          >
            <div className="rounded-xl border border-border/80 bg-background p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">Available balance</p>
              <p className="mt-1 text-2xl font-bold tracking-tight">
                ₦<CountingNumber number={3841200} inView />
              </p>
              <div className="mt-3 flex gap-2">
                <span className="flex-1 rounded-lg bg-primary py-2 text-center text-xs font-semibold text-primary-foreground">
                  Withdraw
                </span>
                <span className="rounded-lg border border-border px-3 py-2 text-center text-xs font-semibold">
                  History
                </span>
              </div>
            </div>
          </FeatureCard>

          <FeatureCard
            icon={<ShieldCheck className="size-5" />}
            title="Fraud-proof by design"
            description="Voter fingerprints keep every count honest - and you decide whether fans vote once or as often as they like."
            delay={0.2}
          >
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { k: "Verified votes", v: "100%" },
                { k: "Duplicate blocks", v: "24.1k" },
                { k: "Secure checkout", v: "PCI-DSS" },
                { k: "Uptime", v: "99.98%" },
              ].map((s) => (
                <div
                  key={s.k}
                  className="rounded-xl border border-border/70 bg-background p-3"
                >
                  <p className="text-sm font-bold">{s.v}</p>
                  <p className="text-[0.7rem] text-muted-foreground">{s.k}</p>
                </div>
              ))}
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  )
}
