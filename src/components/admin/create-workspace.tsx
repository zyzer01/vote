import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"

import { createWorkspace } from "@/lib/api/admin"
import { ApiError } from "@/lib/api/client"
import { adminKeys } from "@/lib/api/admin-queries"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { FolderIcon } from "../icons/folder"

/**
 * Shown to any signed-in user with no voting workspace.
 *
 * Vote never refuses a signed-in Sportly account — this screen is the way
 * forward, not a dead end. It replaces the old "No organization yet" wall,
 * which told people to ask an owner for an invite and linked to a signup that
 * rejected their existing email.
 */
export function CreateWorkspace({ email }: { email?: string }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const trimmed = name.trim()
    if (trimmed.length < 3) {
      setError("Give your workspace a name of at least 3 characters.")
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      await createWorkspace(trimmed)
      // The gate re-reads this query and swaps in the dashboard.
      await queryClient.invalidateQueries({ queryKey: adminKeys.workspaces })
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-svh place-items-center px-5 py-10">
      <div className="w-full max-w-sm">

        <div className="mt-6 text-center">
          <div className="mx-auto grid place-items-center">
            <FolderIcon />
          </div>
          <h1 className="font-heading mt-5 text-xl font-bold">
            Create your workspace
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {email ? (
              <>
                <span className="text-foreground font-medium">{email}</span>{" "}
                isn&apos;t running any voting campaigns yet.
              </>
            ) : (
              "You aren't running any voting campaigns yet."
            )}{" "}
            Name your workspace to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Field label="Workspace name" htmlFor="workspaceName">
            <Input
              id="workspaceName"
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Campus Night Awards"
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
                Creating…
              </>
            ) : (
              <>
                Create workspace
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>

        <p className="text-muted-foreground mt-6 text-center text-xs">
          You can rename it later in settings.
        </p>
      </div>
    </div>
  )
}
