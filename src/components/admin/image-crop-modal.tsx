import { useCallback, useState } from "react"
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react"

import { cn } from "@/lib/utils"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

/**
 * Crop / zoom / reposition step shown after an image is picked, before it is
 * uploaded — so the admin frames the image to the field's aspect ratio instead
 * of uploading a raw file. Mirrors the resize flow the arena app uses.
 */
export function ImageCropModal({
  open,
  src,
  aspect,
  mimeType = "image/jpeg",
  busy,
  onCancel,
  onApply,
}: {
  open: boolean
  /** Data URL (or hosted URL) of the image being adjusted. */
  src: string | null
  /** Target aspect ratio, width / height. */
  aspect: number
  /** Output type for the cropped blob. */
  mimeType?: string
  /** True while the cropped result is being uploaded. */
  busy?: boolean
  onCancel: () => void
  onApply: (blob: Blob) => void
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)
  const [working, setWorking] = useState(false)

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setArea(pixels)
  }, [])

  const reset = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
  }

  const handleApply = async () => {
    if (!src || !area) return
    setWorking(true)
    try {
      const blob = await getCroppedImg(src, area, mimeType)
      onApply(blob)
    } catch {
      const { toast } = await import("sonner")
      toast.error("Couldn't process this image. Try replacing it.")
    } finally {
      setWorking(false)
    }
  }

  const disabled = working || busy

  return (
    <Modal open={open} onClose={disabled ? () => {} : onCancel} className="sm:max-w-lg">
      <div className="p-5">
        <h2 className="font-heading text-lg font-bold">Adjust image</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Drag to reposition and zoom to frame it.
        </p>

        <div className="bg-muted relative mt-4 h-72 w-full overflow-hidden rounded-2xl">
          {src ? (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              showGrid
            />
          ) : null}
        </div>

        {/* Zoom controls */}
        <div className="mt-4 flex items-center gap-3">
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            aria-label="Zoom out"
            disabled={disabled}
            onClick={() => setZoom((z) => Math.max(1, Math.round((z - 0.1) * 10) / 10))}
          >
            <ZoomOut className="size-4" />
          </Button>
          <input
            type="range"
            aria-label="Zoom"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            disabled={disabled}
            onChange={(e) => setZoom(Number(e.target.value))}
            className={cn(
              "accent-primary h-1.5 flex-1 cursor-pointer",
              disabled && "opacity-50",
            )}
          />
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            aria-label="Zoom in"
            disabled={disabled}
            onClick={() => setZoom((z) => Math.min(3, Math.round((z + 0.1) * 10) / 10))}
          >
            <ZoomIn className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Reset"
            disabled={disabled}
            onClick={reset}
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={disabled}>
            Cancel
          </Button>
          <Button
            type="button"
            className="font-semibold"
            onClick={handleApply}
            disabled={disabled || !area}
          >
            {disabled ? <Spinner className="size-4" /> : null}
            Apply
          </Button>
        </div>
      </div>
    </Modal>
  )
}

/** Load an image, tolerating cross-origin hosts that send CORS headers. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** Draw the selected crop region to a canvas and return it as a blob. */
async function getCroppedImg(
  src: string,
  area: Area,
  mimeType: string,
): Promise<Blob> {
  const image = await loadImage(src)
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(area.width)
  canvas.height = Math.round(area.height)
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas unsupported")

  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    area.width,
    area.height,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Empty blob"))),
      mimeType,
      0.92,
    )
  })
}
