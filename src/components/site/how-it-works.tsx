import { Rocket } from "@/components/icons/rocket"
import { Share } from "@/components/icons/share"
import { Stats } from "@/components/icons/stats"
import { BorderBeam } from "@/components/ui/border-beam"
import { Reveal, SectionHeading } from "./primitives"

const STEPS = [
  {
    icon: Rocket,
    step: "01",
    title: "Build your campaign",
    description:
      "Create categories, add nominees -link a player, team or coach, or add anyone custom -and set your prices. Publish a branded page in minutes.",
  },
  {
    icon: Share,
    step: "02",
    title: "Share your voting link",
    description:
      "Drop your campaign link anywhere -Instagram, WhatsApp, X. Fans vote in seconds with card or transfer, no account required.",
  },
  {
    icon: Stats,
    step: "03",
    title: "Watch votes & get paid",
    description:
      "Follow a live leaderboard and real-time analytics as revenue settles straight to your wallet. Withdraw whenever you like.",
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden px-4 py-24 md:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              Live in {" "}
              <span className="text-gray-400">three steps</span>
            </>
          }
          description="Whether it's a national awards night or a weekend fan poll, you can be collecting votes before your coffee gets cold."
        />

        <div className="relative mt-16 grid gap-6 md:grid-cols-3">
          {/* connecting line */}
          <div className="pointer-events-none absolute top-[3.25rem] right-[16%] left-[16%] hidden h-px md:block">
            <div className="h-full w-full bg-[repeating-linear-gradient(to_right,oklch(0.6907_0.1828_151.72/0.4)_0,oklch(0.6907_0.1828_151.72/0.4)_6px,transparent_6px,transparent_12px)]" />
          </div>

          {STEPS.map((s, i) => (
            <Reveal key={s.step} delay={i * 0.12}>
              <div className="group relative flex h-full flex-col items-center overflow-hidden rounded-lg border border-border/70 bg-card/60 p-8 text-center backdrop-blur-sm transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-primary/30">
                {/* faint icon that grows in the background on hover */}
                <s.icon
                  aria-hidden
                  className="pointer-events-none absolute -top-6 -right-6 size-40 text-primary opacity-[0.05] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-125 group-hover:opacity-[0.09]"
                />

                <div className="relative z-10 mb-5">
                  <span className="flex size-16 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15 ring-inset transition-colors duration-500 group-hover:bg-primary/15">
                    <s.icon className="size-9 text-primary-foreground" />
                  </span>
                  <span className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full border border-border bg-background text-xs font-bold text-foreground">
                    {s.step}
                  </span>
                </div>
                <h3 className="relative z-10 text-xl font-semibold tracking-tight">
                  {s.title}
                </h3>
                <p className="relative z-10 mt-3 text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>

                <BorderBeam duration={7} delay={i * 2.4} size={80} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
