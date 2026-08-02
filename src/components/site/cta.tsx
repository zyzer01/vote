import { ArrowRight } from "lucide-react"
import { Reveal } from "./primitives"

export function CTA() {
  return (
    <section className="px-4 py-20 md:py-24">
      <Reveal className="mx-auto max-w-7xl">
        <div className="relative isolate overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center md:px-16 md:py-24">
          {/* texture - brown lines, since white ones vanish on the yellow */}
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.09] [background-image:linear-gradient(to_right,var(--primary-foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--primary-foreground)_1px,transparent_1px)] [background-size:36px_36px]" />
          <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/30 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-primary-foreground/15 blur-[90px]" />

          <span className="border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide uppercase backdrop-blur">
            Ready when you are
          </span>
          <h2 className="font-heading text-primary-foreground mx-auto mt-5 max-w-3xl text-3xl font-bold tracking-tight text-balance sm:text-5xl md:text-[3.25rem] md:leading-[1.05]">
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
          <p className="text-primary-foreground/85 mx-auto mt-5 max-w-xl text-base text-balance md:text-lg">
            Set up a campaign in minutes and start collecting votes today. It&apos;s
            free to launch!
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/signup"
              className="group bg-primary-foreground inline-flex items-center gap-2 rounded-lg px-7 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
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
