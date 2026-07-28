import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createCategory, updateCategory } from "@/lib/api/admin"
import { ApiError } from "@/lib/api/client"
import { adminKeys } from "@/lib/api/admin-queries"
import type { AdminCategory } from "@/lib/api/admin-types"
import { Modal } from "@/components/ui/modal"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ImageUploadField } from "@/components/admin/image-upload-field"

export function CategoryDialog({
  open,
  onClose,
  campaignId,
  category,
}: {
  open: boolean
  onClose: () => void
  campaignId: string
  /** Present when editing; omit to create. */
  category?: AdminCategory | null
}) {
  const queryClient = useQueryClient()
  const editing = Boolean(category)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [priceMajor, setPriceMajor] = useState("")

  useEffect(() => {
    if (open) {
      setName(category?.name ?? "")
      setDescription(category?.description ?? "")
      setImageUrl(category?.imageUrl ?? "")
      setPriceMajor(
        category?.pricePerVoteMinor != null
          ? String(category.pricePerVoteMinor / 100)
          : "",
      )
    }
  }, [open, category])

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        pricePerVoteMinor: priceMajor
          ? Math.round(Number(priceMajor) * 100)
          : undefined,
      }
      return editing
        ? updateCategory(category!.id, payload)
        : createCategory(campaignId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.categories(campaignId) })
      queryClient.invalidateQueries({ queryKey: adminKeys.campaign(campaignId) })
      toast.success(editing ? "Category updated" : "Category added")
      onClose()
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Couldn't save category"),
  })

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (name.trim().length < 2) {
      toast.error("Give the category a name.")
      return
    }
    mutation.mutate()
  }

  return (
    <Modal open={open} onClose={onClose} className="sm:max-w-md">
      <form onSubmit={handleSubmit} className="p-6">
        <h2 className="font-heading text-lg font-bold">
          {editing ? "Edit category" : "Add category"}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Categories are the awards or races voters choose between.
        </p>

        <div className="mt-5 flex flex-col gap-4">
          <Field label="Name" htmlFor="cat-name" required>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Player of the Season"
              autoFocus
            />
          </Field>
          <Field label="Description" htmlFor="cat-desc">
            <Textarea
              id="cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional - shown above the nominees."
            />
          </Field>
          <Field label="Image" htmlFor="cat-image">
            <ImageUploadField
              value={imageUrl}
              onChange={setImageUrl}
              folder="category-images"
              aspect="video"
              disabled={mutation.isPending}
            />
          </Field>
          <Field
            label="Price override"
            htmlFor="cat-price"
            hint="Leave blank to use the campaign price."
          >
            <Input
              id="cat-price"
              type="number"
              min="0"
              value={priceMajor}
              onChange={(e) => setPriceMajor(e.target.value)}
              placeholder="Campaign default"
            />
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" className="font-semibold" disabled={mutation.isPending}>
            {mutation.isPending ? <Spinner /> : null}
            {editing ? "Save" : "Add category"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
