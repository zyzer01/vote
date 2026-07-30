import { useState } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { useGoogleLogin } from "@react-oauth/google"
import { motion } from "motion/react"
import { ArrowRight, Check, Mail } from "lucide-react"

import { signup, signInWithGoogle } from "@/lib/api/admin"
import { ApiError } from "@/lib/api/client"
import { adminKeys } from "@/lib/api/admin-queries"
import { Logo } from "@/components/site/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { GoogleIcon } from "@/components/icons/google"

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [{ title: "Create your account -Sportly Vote" }],
  }),
  component: SignupPage,
})

function SignupPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)
    try {
      await signup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      })
      setSubmitted(true)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 409
            ? "An account with this email already exists."
            : err.message
          : "Something went wrong. Please try again.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      setError(null)
      setSubmitting(true)
      try {
        await signInWithGoogle(codeResponse.code)
        await queryClient.invalidateQueries({ queryKey: adminKeys.session })
        await queryClient.invalidateQueries({ queryKey: adminKeys.workspaces })
        navigate({ to: "/admin" })
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again.",
        )
        setSubmitting(false)
      }
    },
    onError: () => {
      setError("Google sign-in failed. Please try again.")
    },
  })

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

          {submitted ? (
            <>
              <div className="bg-brand-green/10 text-brand-green grid size-14 place-items-center rounded-full">
                <Check className="size-7" strokeWidth={3} />
              </div>
              <h2 className="font-heading mt-6 text-2xl font-bold tracking-tight">
                Check your email
              </h2>
              <p className="text-muted-foreground mt-1.5">
                We sent a verification link to <strong>{email.trim()}</strong>.
                Click it to set your password and get started.
              </p>
            </>
          ) : (
            <>
              <h2 className="font-heading text-2xl font-bold tracking-tight">
                Create your account
              </h2>
              <p className="text-muted-foreground mt-1.5">
                One Sportly account works across every Sportly app.
              </p>

              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={submitting}
                onClick={() => googleLogin()}
                className="mt-6 w-full font-semibold"
              >
                <GoogleIcon className="size-4" />
                Continue with Google
              </Button>

              <div className="my-5 flex items-center gap-3">
                <div className="bg-border h-px flex-1" />
                <span className="text-muted-foreground text-xs uppercase">
                  or
                </span>
                <div className="bg-border h-px flex-1" />
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First name" htmlFor="firstName">
                    <Input
                      id="firstName"
                      autoComplete="given-name"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ada"
                    />
                  </Field>
                  <Field label="Last name" htmlFor="lastName">
                    <Input
                      id="lastName"
                      autoComplete="family-name"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Lovelace"
                    />
                  </Field>
                </div>

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
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-muted-foreground mt-6 text-center text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-foreground font-medium underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
