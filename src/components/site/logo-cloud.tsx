const ORGS = [1, 2, 4, 5, 6, 7, 8]

export function LogoCloud() {
  const track = [...ORGS, ...ORGS]
  return (
    <section className="border-y border-border/60 bg-muted/40 py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
          <p className="shrink-0 text-center text-sm font-medium text-muted-foreground lg:max-w-40 lg:text-left">
            Built for awards, leagues &amp; fan votes across the continent
          </p>
          <div className="group relative w-full overflow-hidden mask-[linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]">
            <div className="flex w-max animate-marquee items-center gap-14 group-hover:paused">
              {track.map((n, i) => (
                <img
                  key={i}
                  src={`/orgs/${n}.svg`}
                  alt=""
                  className="h-7 w-auto text-foreground/70 opacity-60 transition-opacity hover:opacity-100"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
