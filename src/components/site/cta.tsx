import { ArrowRight } from "lucide-react"
import { Reveal } from "./primitives"

export function CTA() {
  return (
    <section className="px-4 py-20 md:py-24">
      <Reveal className="mx-auto max-w-7xl">
        <div className="relative isolate overflow-hidden rounded-3xl bg-brand-green px-6 py-16 text-center md:px-16 md:py-24">
          {/* texture */}
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:36px_36px]" />
          <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/20 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-brand-navy/30 blur-[90px]" />

          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white uppercase backdrop-blur">
            Ready when you are
          </span>
          <h2 className="font-heading mx-auto mt-5 max-w-3xl text-3xl font-bold tracking-tight text-balance text-white sm:text-5xl md:text-[3.25rem] md:leading-[1.05]">
            Crown your next champion with Sportly
            <img
              src="/sportly-mark.png"
              alt=""
              aria-hidden="true"
              width={44}
              height={44}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="mx-2 inline-block size-[0.9em] -translate-y-[0.05em] -rotate-12 align-middle drop-shadow-sm"
            />
            Vote
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-white/85 text-balance md:text-lg">
            Set up a campaign in minutes and start collecting votes today. It&apos;s
            free to launch!
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-brand-green transition-all hover:-translate-y-0.5"
            >
              Start a campaign
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
