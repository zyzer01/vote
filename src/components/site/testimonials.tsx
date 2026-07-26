import { Quote, Star } from "lucide-react"
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"
import { Reveal, SectionHeading } from "./primitives"

const QUOTES = [
  {
    quote:
      "We ran our whole awards night on Sportly Vote. Setup took an afternoon and we tripled last year's ticket revenue from votes alone.",
    name: "Amara Okafor",
    title: "Organizer, NPFL Awards",
  },
  {
    quote:
      "The live leaderboard turned our poll into an event. Fans kept refreshing and buying more votes to push their favourite.",
    name: "Kwame Mensah",
    title: "Director, Accra Sports",
  },
  {
    quote:
      "Payouts hit our wallet instantly and reconciled perfectly. No spreadsheets, no disputes, no headaches.",
    name: "Zainab Ndiaye",
    title: "Finance Lead, CAF Media",
  },
  {
    quote:
      "Free daily votes plus paid boosts was the perfect mix for our talent hunt. Engagement went through the roof.",
    name: "Thabo Botha",
    title: "Producer, Rising Stars SA",
  },
  {
    quote:
      "Fraud used to ruin our online polls. With server-side counting we finally trust the numbers we publish.",
    name: "Fatima El-Amin",
    title: "Community Manager",
  },
]

export function Testimonials() {
  return (
    <section className="relative overflow-hidden px-4 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Loved by organizers"
          title={
            <>
              The teams behind Africa&apos;s biggest{" "}
              <span className="text-muted-foreground">moments</span>
            </>
          }
          description="From national federations to weekend fan polls, organizers choose Sportly Vote to run votes their audience actually trusts."
        />

        {/* featured quote */}
        <Reveal className="mt-14">
          <figure className="relative mx-auto max-w-3xl rounded-2xl border border-border/70 bg-card p-8 text-center md:p-12">
            <Quote className="mx-auto size-9 text-primary/25" />
            <div className="mt-3 flex justify-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-brand-yellow text-brand-yellow" />
              ))}
            </div>
            <blockquote className="mt-5 text-xl font-medium leading-relaxed text-balance md:text-2xl">
              “Sportly Vote let us run a continental awards vote with zero
              engineering. The live results kept fans engaged for weeks and the
              revenue spoke for itself.”
            </blockquote>
            <figcaption className="mt-6 flex items-center justify-center gap-3">
              <img src="/avatars/2.svg" alt="" className="size-11 rounded-full" />
              <div className="text-left">
                <p className="text-sm font-semibold">Kwame Mensah</p>
                <p className="text-xs text-muted-foreground">Director, Accra Sports</p>
              </div>
            </figcaption>
          </figure>
        </Reveal>

        {/* marquee */}
        <div className="mt-10">
          <InfiniteMovingCards items={QUOTES} direction="left" speed="slow" />
        </div>
      </div>
    </section>
  )
}
