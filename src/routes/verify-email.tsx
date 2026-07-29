import { useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { motion } from "motion/react"
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock } from "lucide-react"

import { verifyEmail } from "@/lib/api/admin"
import { ApiError } from "@/lib/api/client"
import { adminKeys } from "@/lib/api/admin-queries"
import { Logo } from "@/components/site/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [{ title: "Verify your email -Sportly Vote" }],
  }),
  validateSearch: (search: Record<string, unknown>): { token?: string } => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: VerifyEmailPage,
})

function VerifyEmailPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { token } = Route.useSearch()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (submitting || !token) return
    if (password !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await verifyEmail(token, password)
      await queryClient.invalidateQueries({ queryKey: adminKeys.session })
      await queryClient.invalidateQueries({ queryKey: adminKeys.access })
      navigate({ to: "/admin" })
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-svh place-items-center bg-background px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        {!token ? (
          <div className="text-center">
            <div className="bg-destructive/10 text-destructive mx-auto grid size-14 place-items-center rounded-full">
              <AlertCircle className="size-7" />
            </div>
            <h2 className="font-heading mt-6 text-2xl font-bold tracking-tight">
              Invalid link
            </h2>
            <p className="text-muted-foreground mt-1.5">
              This verification link is missing its token. Please use the link from your email.
            </p>
          </div>
        ) : (
          <>
            <h2 className="font-heading text-2xl font-bold tracking-tight">
              Set your password
            </h2>
            <p className="text-muted-foreground mt-1.5">
              Choose a password to finish setting up your account.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              <Field label="Password" htmlFor="password" hint="At least 8 characters.">
                <div className="relative">
                  <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
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
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>

              <Field label="Confirm password" htmlFor="confirmPassword">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
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
                    Verifying…
                  </>
                ) : (
                  <>
                    Verify and continue
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}
