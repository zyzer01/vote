import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { List, User } from "lucide-react"

import { bulkCreateNominees, createNominee, updateNominee } from "@/lib/api/admin"
import { ApiError } from "@/lib/api/client"
import { adminKeys } from "@/lib/api/admin-queries"
import type { AdminNominee, NomineePayload } from "@/lib/api/admin-types"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/ui/modal"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ImageUploadField } from "@/components/admin/image-upload-field"

type Mode = "single" | "bulk"

export function NomineeDialog({
  open,
  onClose,
  campaignId,
  categoryId,
  nominee,
}: {
  open: boolean
  onClose: () => void
  campaignId: string
  categoryId: string
  nominee?: AdminNominee | null
}) {
  const queryClient = useQueryClient()
  const editing = Boolean(nominee)
  const [mode, setMode] = useState<Mode>("single")

  const [displayName, setDisplayName] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [bio, setBio] = useState("")
  const [bulk, setBulk] = useState("")

  useEffect(() => {
    if (open) {
      setMode("single")
      setDisplayName(nominee?.displayName ?? "")
      setImageUrl(nominee?.imageUrl ?? "")
      setBio(nominee?.bio ?? "")
      setBulk("")
    }
  }, [open, nominee])

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: adminKeys.nominees(categoryId) })
    queryClient.invalidateQueries({ queryKey: adminKeys.categories(campaignId) })
    queryClient.invalidateQueries({ queryKey: adminKeys.campaign(campaignId) })
  }

  const single = useMutation({
    mutationFn: () => {
      const payload: NomineePayload = {
        displayName: displayName.trim(),
        imageUrl: imageUrl.trim() || undefined,
        bio: bio.trim() || undefined,
      }
      return editing
        ? updateNominee(nominee!.id, payload)
        : createNominee(categoryId, payload)
    },
    onSuccess: () => {
      invalidate()
      toast.success(editing ? "Nominee updated" : "Nominee added")
      onClose()
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Couldn't save nominee"),
  })

  const bulkMutation = useMutation({
    mutationFn: () => bulkCreateNominees(categoryId, parseBulk(bulk)),
    onSuccess: (result) => {
      invalidate()
      if (result.failed > 0) {
        toast.warning(
          `Added ${result.created}, ${result.failed} failed`,
          { description: "Check the rows and try the failed ones again." },
        )
      } else {
        toast.success(`Added ${result.created} nominees`)
      }
      onClose()
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Couldn't add nominees"),
  })

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (mode === "single") {
      if (displayName.trim().length < 1) {
        toast.error("Enter a nominee name.")
        return
      }
      single.mutate()
    } else {
      const rows = parseBulk(bulk)
      if (rows.length === 0) {
        toast.error("Add at least one nominee, one per line.")
        return
      }
      bulkMutation.mutate()
    }
  }

  const pending = single.isPending || bulkMutation.isPending
  const rowCount = parseBulk(bulk).length

  return (
    <Modal open={open} onClose={onClose} className="sm:max-w-md">
      <form onSubmit={handleSubmit} className="p-6">
        <h2 className="font-heading text-lg font-bold">
          {editing ? "Edit nominee" : "Add nominees"}
        </h2>

        {!editing ? (
          <div className="bg-muted mt-4 grid grid-cols-2 gap-1 rounded-xl p-1">
            <ModeTab
              active={mode === "single"}
              onClick={() => setMode("single")}
              icon={User}
              label="One nominee"
            />
            <ModeTab
              active={mode === "bulk"}
              onClick={() => setMode("bulk")}
              icon={List}
              label="Paste a list"
            />
          </div>
        ) : null}

        {mode === "single" ? (
          <div className="mt-5 flex flex-col gap-4">
            <Field label="Name" htmlFor="nom-name" required>
              <Input
                id="nom-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Chioma Okafor"
                autoFocus
              />
            </Field>
            <Field label="Photo" hint="Optional headshot for the nominee.">
              <ImageUploadField
                value={imageUrl}
                onChange={setImageUrl}
                folder="nominee-photos"
                aspect="square"
              />
            </Field>
            <Field label="Bio" htmlFor="nom-bio">
              <Textarea
                id="nom-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Optional short description."
              />
            </Field>
          </div>
        ) : (
          <div className="mt-5">
            <Field
              label="One nominee per line"
              htmlFor="nom-bulk"
              hint='Use "Name, https://image-url" to include a photo.'
            >
              <Textarea
                id="nom-bulk"
                value={bulk}
                onChange={(e) => setBulk(e.target.value)}
                rows={8}
                placeholder={"Chioma Okafor\nDavid Mensah, https://…\nAmara Nwosu"}
                className="font-mono text-sm"
              />
            </Field>
            {rowCount > 0 ? (
              <p className="text-muted-foreground mt-2 text-xs">
                {rowCount} nominee{rowCount === 1 ? "" : "s"} ready to add.
              </p>
            ) : null}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="submit" className="font-semibold" disabled={pending}>
            {pending ? <Spinner /> : null}
            {editing
              ? "Save"
              : mode === "bulk"
                ? `Add ${rowCount || ""} nominees`.trim()
                : "Add nominee"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function ModeTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: typeof User
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  )
}

/** Parse the bulk textarea: each non-empty line becomes a nominee. */
function parseBulk(text: string): NomineePayload[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, image] = line.split(/,(.+)/).map((p) => p?.trim())
      return {
        displayName: name,
        ...(image ? { imageUrl: image } : {}),
      } satisfies NomineePayload
    })
    .filter((n) => n.displayName && n.displayName.length > 0)
}
