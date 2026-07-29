import { Loader } from "@/components/ui/loader"
import { cn } from "@/lib/utils"

/**
 * The app's single full-screen loading overlay: the shader loader in the
 * primary color on the page background, no wordmark or mark. Used for the auth
 * splash on a fresh reload and as the router's default pending state.
 */
export function GlobalLoader({
  className,
  speed = 1,
}: {
  className?: string
  speed?: number
}) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "bg-background fixed inset-0 z-50 grid place-items-center",
        className
      )}
    >
      <Loader
        shape="sphere"
        variant="dither"
        size="default"
        color="var(--color-primary)"
        speed={speed}
      />
    </div>
  )
}
