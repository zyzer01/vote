import { createFileRoute } from "@tanstack/react-router"
import { Navbar } from "@/components/site/navbar"
import { Hero } from "@/components/site/hero"
import { LogoCloud } from "@/components/site/logo-cloud"
import { Features } from "@/components/site/features"
import { HowItWorks } from "@/components/site/how-it-works"
import { Showcase } from "@/components/site/showcase"
import { Testimonials } from "@/components/site/testimonials"
import { CTA } from "@/components/site/cta"
import { Footer } from "@/components/site/footer"

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      {
        title: "Sportly Vote -Run world-class voting campaigns in Africa",
      },
      {
        name: "description",
        content:
          "Launch branded voting campaigns in minutes. Collect paid and free votes, watch a live leaderboard, and get settled straight to your wallet. Built for organizers across Africa.",
      },
    ],
  }),
  component: Welcome,
})

function Welcome() {
  return (
    <div className="min-h-svh bg-background">
      <Navbar />
      <main>
        <Hero />
        <LogoCloud />
        <Features />
        <HowItWorks />
        <Showcase />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
