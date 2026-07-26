import { AlertTriangle } from "lucide-react"

import { Modal } from "./modal"
import { Button } from "./button"
import { Spinner } from "./spinner"

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  destructive,
  loading,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  destructive?: boolean
  loading?: boolean
}) {
  return (
    <Modal open={open} onClose={onClose} className="sm:max-w-sm">
      <div className="p-6">
        <div
          className={
            destructive
              ? "bg-destructive/10 text-destructive grid size-12 place-items-center rounded-2xl"
              : "bg-primary/10 text-primary grid size-12 place-items-center rounded-2xl"
          }
        >
          <AlertTriangle className="size-6" />
        </div>
        <h2 className="font-heading mt-4 text-lg font-bold">{title}</h2>
        <p className="text-muted-foreground mt-1.5 text-sm">{description}</p>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={loading}
            className="font-semibold"
          >
            {loading ? <Spinner /> : null}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
