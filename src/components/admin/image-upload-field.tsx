import { useRef, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { ImageIcon, Upload, X } from "lucide-react"
import { toast } from "sonner"

import { uploadImage } from "@/lib/api/admin"
import { ApiError } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Modal } from "@/components/ui/modal"
import { ImageCropModal } from "@/components/admin/image-crop-modal"

const MAX_SIZE_MB = 5
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]

/**
 * Upload control for an image field. The admin picks a file, frames it in a
 * crop/zoom step, and we upload the adjusted result to the media service — so
 * `coverImageUrl` / `logoUrl` are real upload paths, not pasted URLs.
 *
 * Renders as a compact input-sized row (thumbnail + actions) with a full-size
 * preview modal and a crop modal for adjusting the framing.
 */
export function ImageUploadField({
  value,
  onChange,
  folder,
  disabled,
  aspect = "video",
  className,
}: {
  value: string
  onChange: (url: string) => void
  /** Storage folder the file lands in, e.g. "campaign-covers". */
  folder: string
  disabled?: boolean
  /** "video" for a wide cover, "square" for a logo/nominee. */
  aspect?: "video" | "square"
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  // Source + mime for the crop modal. `cropSrc` is a data/hosted URL; when set,
  // the crop modal is open.
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [cropMime, setCropMime] = useState("image/jpeg")

  const aspectRatio = aspect === "square" ? 1 : 16 / 9

  const upload = useMutation({
    mutationFn: (file: File) => uploadImage(file, folder),
    onSuccess: (media) => {
      onChange(media.url)
      setCropSrc(null)
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError ? error.message : "Couldn't upload image",
      ),
  })

  const handleFile = (file: File | undefined) => {
    if (!file) return
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Use a JPG, PNG, WebP, GIF, or AVIF image.")
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_SIZE_MB}MB.`)
      return
    }
    // Read the file, then open the crop step. GIFs/AVIF crop to a static frame,
    // so keep those as-is and upload directly.
    const canCrop = file.type !== "image/gif"
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      if (canCrop) {
        setCropMime(file.type === "image/avif" ? "image/webp" : file.type)
        setCropSrc(dataUrl)
      } else {
        upload.mutate(file)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCropped = (blob: Blob) => {
    const ext = cropMime === "image/png" ? "png" : cropMime === "image/webp" ? "webp" : "jpg"
    const file = new File([blob], `image.${ext}`, { type: cropMime })
    upload.mutate(file)
  }

  const busy = upload.isPending
  const interactive = !disabled && !busy
  const pick = () => inputRef.current?.click()

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          e.target.value = ""
        }}
        disabled={disabled}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (interactive) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (interactive) handleFile(e.dataTransfer.files[0])
        }}
        className={cn(
          "border-input bg-background flex items-center gap-3 rounded-lg border px-2.5 py-2 transition-colors",
          dragging && "border-ring bg-muted/50",
          disabled && "opacity-60",
        )}
      >
        {/* Thumbnail / placeholder */}
        <button
          type="button"
          disabled={!value || busy}
          onClick={() => setPreviewOpen(true)}
          aria-label={value ? "Preview image" : undefined}
          className={cn(
            "bg-muted relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-md",
            value && !busy && "cursor-zoom-in",
          )}
        >
          {value ? (
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <ImageIcon className="text-muted-foreground size-4.5" />
          )}
          {busy ? (
            <div className="bg-background/70 absolute inset-0 grid place-items-center">
              <Spinner className="size-4" />
            </div>
          ) : null}
        </button>

        {/* Status text */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {busy ? "Uploading…" : value ? "Image added" : "No image yet"}
          </p>
          <p className="text-muted-foreground truncate text-xs">
            {value ? "Click the thumbnail to preview" : "JPG, PNG, WebP up to 5MB"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          {value ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!interactive}
                onClick={pick}
              >
                <Upload className="size-3.5" />
                Replace
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label="Remove image"
                disabled={!interactive}
                onClick={() => onChange("")}
              >
                <X className="size-4" />
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!interactive}
              onClick={pick}
            >
              <Upload className="size-3.5" />
              Upload
            </Button>
          )}
        </div>
      </div>

      {/* Full-size preview */}
      {value ? (
        <Modal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          className="sm:max-w-xl"
        >
          <div className="p-4">
            <div
              className={cn(
                "bg-muted overflow-hidden rounded-2xl",
                aspect === "square" ? "aspect-square" : "aspect-video",
              )}
            >
              <img src={value} alt="" className="size-full object-contain" />
            </div>
          </div>
        </Modal>
      ) : null}

      {/* Crop / adjust */}
      <ImageCropModal
        open={cropSrc !== null}
        src={cropSrc}
        aspect={aspectRatio}
        mimeType={cropMime}
        busy={busy}
        onCancel={() => setCropSrc(null)}
        onApply={handleCropped}
      />
    </div>
  )
}
