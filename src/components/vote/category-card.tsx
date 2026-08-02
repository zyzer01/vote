import { Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import { ArrowRight, Users } from "lucide-react"

import type { CampaignCategorySummary, PublicCampaign } from "@/lib/api/types"
import { formatMoney } from "@/lib/format"

export function CategoryCard({
  category,
  campaign,
  organizationCode,
  index,
}: {
  category: CampaignCategorySummary
  campaign: PublicCampaign
  organizationCode: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.4) }}
    >
      <Link
        to="/$organizationCode/$campaignSlug/$categoryId"
        params={{
          organizationCode,
          campaignSlug: campaign.slug,
          categoryId: category.id,
        }}
        className="group border-border/70 bg-card hover:border-primary/40 relative flex h-full flex-col overflow-hidden rounded-lg border transition-colors duration-300"
      >
        {/* Media */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {category.imageUrl ? (
            <img
              src={category.imageUrl}
              alt=""
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="size-full"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in oklch, var(--primary), transparent 15%), color-mix(in oklch, var(--primary), black 35%))",
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent opacity-60" />
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <Users className="size-3.5" />
            {category.nomineeCount} nominees
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-heading text-lg font-semibold tracking-tight">
            {category.name}
          </h3>
          {category.description ? (
            <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm">
              {category.description}
            </p>
          ) : null}

          <div className="mt-4 flex items-center justify-between pt-1">
            <span className="text-muted-foreground text-sm">
              {campaign.votingMode === "FREE" ? (
                <span className="text-brand-green-700 dark:text-brand-green font-medium">
                  Free to vote
                </span>
              ) : (
                <>
                  <span className="text-foreground font-semibold">
                    {formatMoney(category.pricePerVoteMinor, campaign.currency)}
                  </span>{" "}
                  / vote
                </>
              )}
            </span>
            <span className="text-foreground inline-flex items-center gap-1 text-sm font-semibold">
              Vote
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
