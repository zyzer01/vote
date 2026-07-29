import { useEffect, useRef, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"
import { AlertCircle, ArrowRight, Check, Clock, Loader2 } from "lucide-react"

import { confirmVoteOrder } from "@/lib/api/voting"
import { voteErrorMessage } from "@/hooks/use-vote-actions"
import type { ConfirmVoteResponse } from "@/lib/api/types"
import { formatMoney } from "@/lib/format"
import { buttonVariants } from "@/components/ui/button"

/** Paystack appends one of these; our own callback uses `ref`. */
const REF_KEYS = ["ref", "reference", "trxref"] as const

export const Route = createFileRoute("/vote/callback")({
  validateSearch: (search: Record<string, unknown>) => ({
    ref: search.ref as string,
    reference: search.reference as string,
    trxref: search.trxref as string,
  }),
  component: CallbackPage,
})

type Phase = "checking" | "success" | "pending" | "failed" | "error"

function CallbackPage() {
  const search = Route.useSearch()
  const reference = REF_KEYS.map((k) => search[k]).find(Boolean)

  const [phase, setPhase] = useState<Phase>("checking")
  const [result, setResult] = useState<ConfirmVoteResponse | null>(null)
  const [message, setMessage] = useState<string>("")
  const attempts = useRef(0)
  const returnPath = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      returnPath.current = sessionStorage.getItem("sportly.vote.return")
    }
  }, [])

  useEffect(() => {
    if (!reference) {
      setPhase("error")
      setMessage("No payment reference was found in the link.")
      return
    }

    let cancelled = false
    let timer: ReturnType<typeof setTimeout>

    const check = async () => {
      attempts.current += 1
      try {
        const res = await confirmVoteOrder(reference)
        if (cancelled) return
        setResult(res)

        if (res.counted || res.status === "PAID") {
          setPhase("success")
          return
        }
        if (res.status === "PENDING" && attempts.current < 5) {
          // Webhook may still be settling -retry with backoff.
          setPhase("pending")
          timer = setTimeout(check, 2500)
          return
        }
        setPhase(res.status === "PENDING" ? "pending" : "failed")
        setMessage(res.message ?? "")
      } catch (err) {
        if (cancelled) return
        setPhase("error")
        setMessage(voteErrorMessage(err))
      }
    }

    void check()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [reference])

  return (
    <main className="grid min-h-svh place-items-center bg-gray-100 px-5">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-background overflow-hidden rounded-3xl p-8 text-center shadow-2xl"
        >
          <PhaseVisual phase={phase} />

          <h1 className="font-heading mt-6 text-2xl font-bold">
            {phase === "checking"
              ? "Confirming your payment…"
              : phase === "success"
                ? "Your votes are in! 🎉"
                : phase === "pending"
                  ? "Almost there…"
                  : phase === "failed"
                    ? "Payment not completed"
                    : "Something went wrong"}
          </h1>

          <p className="text-muted-foreground mt-2 text-sm">
            {phase === "checking" || phase === "pending"
              ? "Hang tight while we confirm your payment with the bank. This only takes a moment."
              : phase === "success" && result
                ? `${result.quantity ?? ""} vote${result.quantity === 1 ? "" : "s"} counted${
                    result.amountMinor
                      ? ` · ${formatMoney(result.amountMinor, result.currency ?? "NGN")}`
                      : ""
                  }.`
                : message || "Please try again or contact the organizer."}
          </p>

          {phase !== "checking" ? (
            <div className="mt-7 flex flex-col gap-2.5">
              <a
                href={returnPath.current ?? "/"}
                className={buttonVariants({ size: "lg", className: "h-12 text-base font-semibold" })}
              >
                {returnPath.current
                  ? phase === "success"
                    ? "Back to voting"
                    : "Try again"
                  : "Continue"}
                <ArrowRight className="size-4" />
              </a>
            </div>
          ) : null}
        </motion.div>

        <p className="mt-5 text-center text-xs text-white/50">
          Secured checkout · Sportly Vote
        </p>
      </div>
    </main>
  )
}

function PhaseVisual({ phase }: { phase: Phase }) {
  if (phase === "checking" || phase === "pending") {
    return (
      <div className="bg-primary/10 text-primary mx-auto grid size-20 place-items-center rounded-full">
        {phase === "pending" ? (
          <Clock className="size-9" />
        ) : (
          <Loader2 className="size-9 animate-spin" />
        )}
      </div>
    )
  }

  if (phase === "success") {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 16 }}
        className="bg-brand-green mx-auto grid size-20 place-items-center rounded-full text-white"
      >
        <Check className="size-10" strokeWidth={3} />
      </motion.div>
    )
  }

  return (
    <div className="bg-destructive/10 text-destructive mx-auto grid size-20 place-items-center rounded-full">
      <AlertCircle className="size-9" />
    </div>
  )
}
