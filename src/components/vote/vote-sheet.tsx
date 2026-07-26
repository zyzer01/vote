import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, CreditCard, Gift, Loader2, Lock, Minus, Plus } from "lucide-react"
import { toast } from "sonner"

import type {
  BallotNominee,
  CategoryBallot,
  FreeVoteAllowance,
} from "@/lib/api/types"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar } from "@/components/ui/avatar"
import { useVoteActions, voteErrorMessage } from "@/hooks/use-vote-actions"

type Mode = "free" | "paid"

export function VoteSheet({
  nominee,
  ballot,
  allowance,
  onClose,
  onVoted,
}: {
  nominee: BallotNominee | null
  ballot: CategoryBallot
  allowance: FreeVoteAllowance | undefined
  onClose: () => void
  onVoted: (nomineeId: string) => void
}) {
  const campaign = ballot.campaign
  const unitPrice = ballot.pricePerVoteMinor
  const { freeVote, paidCheckout } = useVoteActions(campaign.id, ballot.id)

  const freeAvailable =
    campaign.votingMode !== "PAID" &&
    (allowance?.freeVotingEnabled ?? false) &&
    (allowance?.remaining ?? 0) > 0
  const paidAvailable = campaign.votingMode !== "FREE" && unitPrice > 0

  const [mode, setMode] = useState<Mode>("paid")
  const [quantity, setQuantity] = useState(campaign.minVotesPerOrder || 1)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [succeeded, setSucceeded] = useState(false)

  // Reset local state whenever a new nominee opens the sheet.
  const activeNomineeId = nominee?.id ?? null
  useEffect(() => {
    if (!activeNomineeId) return
    setMode(paidAvailable ? "paid" : "free")
    setQuantity(campaign.minVotesPerOrder || 1)
    setSucceeded(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNomineeId])

  const maxQty = campaign.maxVotesPerOrder ?? 100
  const minQty = campaign.minVotesPerOrder || 1
  const subtotal = quantity * unitPrice

  function handleFree() {
    if (!nominee) return
    freeVote.mutate(nominee.id, {
      onSuccess: (res) => {
        setSucceeded(true)
        onVoted(nominee.id)
        toast.success("Vote counted!", {
          description:
            res.votesRemaining > 0
              ? `You have ${res.votesRemaining} free vote${res.votesRemaining === 1 ? "" : "s"} left in this category.`
              : "That was your last free vote in this category.",
        })
        setTimeout(onClose, 1400)
      },
      onError: (err) => toast.error(voteErrorMessage(err)),
    })
  }

  function handlePaid() {
    if (!nominee) return
    if (!isValidEmail(email)) {
      toast.error("Enter a valid email for your receipt.")
      return
    }
    paidCheckout.mutate(
      {
        nomineeId: nominee.id,
        quantity,
        voterEmail: email.trim(),
        voterName: name.trim() || undefined,
      },
      { onError: (err) => toast.error(voteErrorMessage(err)) },
    )
  }

  const showToggle = freeAvailable && paidAvailable
  const redirecting = paidCheckout.isPending || paidCheckout.isSuccess

  return (
    <Modal open={Boolean(nominee)} onClose={onClose} labelledBy="vote-sheet-title">
      {nominee ? (
        <div className="flex flex-col">
          {/* Nominee header */}
          <div className="from-primary/12 flex items-center gap-3.5 bg-gradient-to-b to-transparent px-6 pt-8 pb-5">
            <Avatar
              src={nominee.imageUrl}
              name={nominee.displayName}
              className="size-14 ring-2 ring-white/60"
            />
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Voting for
              </p>
              <h2
                id="vote-sheet-title"
                className="font-heading truncate text-xl font-bold"
              >
                {nominee.displayName}
              </h2>
              <p className="text-muted-foreground truncate text-sm">
                {ballot.name}
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {succeeded ? (
              <SuccessState key="success" name={nominee.displayName} />
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-6 pb-8"
              >
                {showToggle ? (
                  <div className="bg-muted mb-5 grid grid-cols-2 gap-1 rounded-xl p-1">
                    <ToggleTab
                      active={mode === "free"}
                      onClick={() => setMode("free")}
                      icon={<Gift className="size-4" />}
                      label="Free vote"
                    />
                    <ToggleTab
                      active={mode === "paid"}
                      onClick={() => setMode("paid")}
                      icon={<CreditCard className="size-4" />}
                      label="Paid votes"
                    />
                  </div>
                ) : null}

                {mode === "free" && freeAvailable ? (
                  <FreePanel
                    remaining={allowance?.remaining ?? 0}
                    pending={freeVote.isPending}
                    onSubmit={handleFree}
                  />
                ) : paidAvailable ? (
                  <PaidPanel
                    quantity={quantity}
                    setQuantity={(q) =>
                      setQuantity(Math.max(minQty, Math.min(maxQty, q)))
                    }
                    minQty={minQty}
                    maxQty={maxQty}
                    unitPrice={unitPrice}
                    subtotal={subtotal}
                    currency={campaign.currency}
                    email={email}
                    setEmail={setEmail}
                    name={name}
                    setName={setName}
                    redirecting={redirecting}
                    onSubmit={handlePaid}
                  />
                ) : (
                  <p className="text-muted-foreground py-6 text-center text-sm">
                    Voting isn't available right now.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : null}
    </Modal>
  )
}

function ToggleTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {active ? (
        <motion.span
          layoutId="vote-toggle"
          className="bg-background absolute inset-0 rounded-lg shadow-sm"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      ) : null}
      <span className="relative z-10 flex items-center gap-1.5">
        {icon}
        {label}
      </span>
    </button>
  )
}

function FreePanel({
  remaining,
  pending,
  onSubmit,
}: {
  remaining: number
  pending: boolean
  onSubmit: () => void
}) {
  return (
    <div>
      <div className="border-brand-green/25 bg-brand-green/8 flex items-center gap-3 rounded-xl border p-4">
        <div className="bg-brand-green/15 text-brand-green-700 dark:text-brand-green grid size-10 place-items-center rounded-lg">
          <Gift className="size-5" />
        </div>
        <div>
          <p className="font-semibold">
            {remaining} free vote{remaining === 1 ? "" : "s"} left
          </p>
          <p className="text-muted-foreground text-sm">
            in this category -no payment needed.
          </p>
        </div>
      </div>
      <Button
        size="lg"
        onClick={onSubmit}
        disabled={pending || remaining <= 0}
        className="mt-5 h-12 w-full text-base font-semibold"
      >
        {pending ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <>
            <Gift className="size-5" />
            Cast free vote
          </>
        )}
      </Button>
    </div>
  )
}

function PaidPanel({
  quantity,
  setQuantity,
  minQty,
  maxQty,
  unitPrice,
  subtotal,
  currency,
  email,
  setEmail,
  name,
  setName,
  redirecting,
  onSubmit,
}: {
  quantity: number
  setQuantity: (q: number) => void
  minQty: number
  maxQty: number
  unitPrice: number
  subtotal: number
  currency: string
  email: string
  setEmail: (v: string) => void
  name: string
  setName: (v: string) => void
  redirecting: boolean
  onSubmit: () => void
}) {
  const quickAdds = [1, 5, 10, 25].filter((n) => n <= maxQty)

  return (
    <div className="flex flex-col gap-5">
      {/* Quantity stepper */}
      <div>
        <Label className="mb-2">Number of votes</Label>
        <div className="border-border flex items-center justify-between rounded-xl border p-1.5">
          <StepperButton
            onClick={() => setQuantity(quantity - 1)}
            disabled={quantity <= minQty}
            aria-label="Fewer votes"
          >
            <Minus className="size-4" />
          </StepperButton>
          <div className="text-center">
            <div className="font-heading text-3xl font-bold tabular-nums">
              {quantity}
            </div>
          </div>
          <StepperButton
            onClick={() => setQuantity(quantity + 1)}
            disabled={quantity >= maxQty}
            aria-label="More votes"
          >
            <Plus className="size-4" />
          </StepperButton>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {quickAdds.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setQuantity(n)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                quantity === n
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              {n} {n === 1 ? "vote" : "votes"}
            </button>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="flex flex-col gap-3">
        <div>
          <Label htmlFor="voter-email" className="mb-1.5">
            Email <span className="text-muted-foreground font-normal">(for your receipt)</span>
          </Label>
          <Input
            id="voter-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="voter-name" className="mb-1.5">
            Name <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="voter-name"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>

      {/* Total */}
      <div className="bg-muted/60 flex items-center justify-between rounded-xl px-4 py-3">
        <div>
          <p className="text-sm font-medium">
            {quantity} × {formatMoney(unitPrice, currency)}
          </p>
          <p className="text-muted-foreground text-xs">
            Final total confirmed at secure checkout
          </p>
        </div>
        <p className="font-heading text-2xl font-bold tabular-nums">
          {formatMoney(subtotal, currency)}
        </p>
      </div>

      <Button
        size="lg"
        onClick={onSubmit}
        disabled={redirecting}
        className="h-12 w-full text-base font-semibold"
      >
        {redirecting ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            Redirecting…
          </>
        ) : (
          <>
            <Lock className="size-4" />
            Pay {formatMoney(subtotal, currency)}
          </>
        )}
      </Button>
      <p className="text-muted-foreground -mt-1 text-center text-xs">
        Secured by TagPay · You'll return here after payment
      </p>
    </div>
  )
}

function StepperButton({
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className="bg-background hover:bg-muted disabled:opacity-40 grid size-11 place-items-center rounded-lg border transition-colors disabled:pointer-events-none"
      {...props}
    >
      {children}
    </button>
  )
}

function SuccessState({ name }: { name: string }) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center px-6 pt-2 pb-10 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="bg-brand-green grid size-16 place-items-center rounded-full text-white"
      >
        <Check className="size-8" strokeWidth={3} />
      </motion.div>
      <h3 className="font-heading mt-4 text-xl font-bold">Vote counted!</h3>
      <p className="text-muted-foreground mt-1 text-sm">
        Thanks for backing {name}.
      </p>
    </motion.div>
  )
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}
