import { useState } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { motion } from "motion/react"
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react"

import { signin } from "@/lib/api/admin"
import { ApiError } from "@/lib/api/client"
import { adminKeys } from "@/lib/api/admin-queries"
import { Logo } from "@/components/site/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign in -Sportly Vote" }],
  }),
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { redirect } = Route.useSearch()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)
    try {
      await signin(email.trim(), password)
      // Prime the session so the dashboard shell resolves immediately.
      await queryClient.invalidateQueries({ queryKey: adminKeys.session })
      await queryClient.invalidateQueries({ queryKey: adminKeys.access })
      navigate({ to: redirect ?? "/admin" })
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 401
            ? "Incorrect email or password."
            : err.message
          : "Something went wrong. Please try again.",
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-brand-navy lg:block">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 80% at 20% 10%, color-mix(in oklch, var(--color-brand-green), transparent 55%) 0%, transparent 55%), radial-gradient(70% 70% at 90% 90%, color-mix(in oklch, var(--color-brand-yellow), transparent 70%) 0%, transparent 55%)",
          }}
        />
        <div className="animate-aurora absolute -inset-[40%] opacity-30 [background:conic-gradient(from_0deg,transparent,var(--color-brand-green),transparent_40%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo wordmarkClassName="text-white" />
          <div className="max-w-md">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-heading text-4xl leading-tight font-bold tracking-tight"
            >
              Run world-class voting campaigns.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 text-lg text-white/70"
            >
              Create campaigns, add nominees, and watch votes and revenue roll in
              from one premium dashboard.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <h2 className="font-heading text-2xl font-bold tracking-tight">
            Welcome back
          </h2>
          <p className="text-muted-foreground mt-1.5">
            Sign in to manage your voting campaigns.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <Field label="Email" htmlFor="email">
              <div className="relative">
                <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@organization.com"
                  className="pl-10"
                />
              </div>
            </Field>

            <Field label="Password" htmlFor="password">
              <div className="relative">
                <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="px-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </Field>

            {error ? (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-destructive/10 text-destructive rounded-lg px-3.5 py-2.5 text-sm"
              >
                {error}
              </motion.p>
            ) : null}

            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="mt-2 w-full font-semibold"
            >
              {submitting ? (
                <>
                  <Spinner />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-muted-foreground mt-6 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
