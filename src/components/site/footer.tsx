import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandX,
} from "@tabler/icons-react"
import { Logo } from "./logo"

const LINKS = [
  { label: "Blog", href: "https://www.sportly.africa/blog" },
  { label: "Arena", href: "https://arena.sportly.africa/" },
  { label: "Privacy Policy", href: "https://www.sportly.africa/privacy-policy" },
  { label: "Terms of Service", href: "https://www.sportly.africa/terms-of-service" },
]

const SOCIALS = [
  { label: "Facebook", href: "https://www.facebook.com/sportlyafrica", Icon: IconBrandFacebook },
  { label: "X", href: "https://x.com/sportlyafrica", Icon: IconBrandX },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/sportly-africa", Icon: IconBrandLinkedin },
  { label: "Instagram", href: "https://www.instagram.com/sportlyafrica", Icon: IconBrandInstagram },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Run world-class Voting Campaigns.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Sportly. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                <Icon className="size-[1.15rem]" stroke={1.75} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* oversized brand wordmark */}
      <div className="relative overflow-hidden pt-8">
        <span className="block select-none text-center font-bold leading-[0.78] tracking-tighter text-foreground/[0.06] [font-size:clamp(4.5rem,26vw,19rem)]">
          Sportly
        </span>
      </div>
    </footer>
  )
}
