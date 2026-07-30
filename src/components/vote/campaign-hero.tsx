import { Building2, CalendarDays, Coins, Vote } from "lucide-react"

import type { CampaignLanding } from "@/lib/api/types"
import {
  getCampaignState,
  votingModeLabel,
} from "@/lib/campaign-state"
import { formatDate, formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Countdown } from "./countdown"
import { StatusPill } from "./status-pill"

export function CampaignHero({
  campaign,
  onCountdownComplete,
}: {
  campaign: CampaignLanding
  onCountdownComplete?: () => void
}) {
  const state = getCampaignState(campaign)
  const hasCover = Boolean(campaign.coverImageUrl)
  const totalNominees = campaign.categories.reduce(
    (sum, c) => sum + c.nomineeCount,
    0,
  )

  return (
    <section className="relative overflow-hidden">
      {/* Backdrop: cover image, else brand gradient. */}
      <div className="absolute inset-0 -z-10">
        {hasCover ? (
          <>
            <img
              src={campaign.coverImageUrl!}
              alt=""
              className="size-full scale-105 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/85 to-brand-navy/45" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/70 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-brand-navy">
            <div
              className="absolute inset-0 opacity-90"
              style={{
                background:
                  "radial-gradient(120% 90% at 15% 0%, color-mix(in oklch, var(--primary), transparent 35%) 0%, transparent 55%), radial-gradient(100% 80% at 100% 20%, color-mix(in oklch, var(--primary), black 30%) 0%, transparent 60%)",
              }}
            />
          </div>
        )}
        {/* Soft grid texture. */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(100% 100% at 50% 0%, black 30%, transparent 80%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-5xl px-5 pt-12 pb-10 text-white sm:pt-16 sm:pb-14">
        <div className="flex flex-col items-center text-center">
          <div className="flex flex-col items-center">
            {campaign.logoUrl ? (
              <img
                src={campaign.logoUrl}
                alt={campaign.voteOrganization.name}
                className="mb-4 h-14 w-auto rounded-2xl bg-white/10 object-contain p-2 backdrop-blur-sm sm:h-16"
              />
            ) : (
              <span className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide backdrop-blur-sm">
                <Building2 className="size-3.5" />
                {campaign.voteOrganization.name}
              </span>
            )}

            <StatusPill state={state.state} label={state.label} />

            <h1 className="font-heading mt-4 text-balance text-4xl font-bold tracking-tight sm:text-6xl">
              {campaign.name}
            </h1>

            {campaign.description ? (
              <p className="mt-3 max-w-2xl text-balance text-base text-white/75 sm:text-lg">
                {campaign.description}
              </p>
            ) : null}
          </div>

          {/* Countdown */}
          {state.countdownTo ? (
            <div className="mt-6">
              <Countdown
                to={state.countdownTo}
                label={state.countdownLabel}
                onComplete={onCountdownComplete}
              />
            </div>
          ) : null}

          {/* Fact strip */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            <HeroFact
              icon={<Vote className="size-3.5" />}
              text={votingModeLabel(campaign.votingMode)}
            />
            {campaign.votingMode !== "FREE" ? (
              <HeroFact
                icon={<Coins className="size-3.5" />}
                text={`${formatMoney(campaign.pricePerVoteMinor, campaign.currency)} / vote`}
              />
            ) : null}
            <HeroFact
              text={`${campaign.categories.length} ${campaign.categories.length === 1 ? "category" : "categories"}`}
            />
            <HeroFact text={`${totalNominees} nominees`} />
            <HeroFact
              icon={<CalendarDays className="size-3.5" />}
              text={`Ends ${formatDate(campaign.closesAt)}`}
            />
          </div>
        </div>
      </div>

      {/* Curve into the content. */}
      <div className="bg-background h-8 rounded-t-[2rem]" />
    </section>
  )
}

function HeroFact({
  icon,
  text,
  className,
}: {
  icon?: React.ReactNode
  text: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/85 backdrop-blur-sm ring-1 ring-white/10",
        className,
      )}
    >
      {icon}
      {text}
    </span>
  )
}
