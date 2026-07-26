/**
 * Thin fetch wrapper for the Sportly API.
 *
 * The API wraps every success as `{ success: true, data }` and every error as
 * `{ statusCode, message, path, timestamp, code }` (where `message` may be a
 * string or an array of validation strings). This module unwraps `data` on
 * success and throws a typed {@link ApiError} on failure, so callers only ever
 * deal with the payload.
 *
 * Auth is cookie based: the vote app sends `X-Sportly-Client: vote` so the API
 * writes/reads the `accessToken_vote` cookie namespace, and `credentials:
 * "include"` carries those cookies. Voting routes are versioned under `/v1`;
 * auth routes are version-neutral at the root.
 */

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000"
).replace(/\/$/, "")

export const SPORTLY_CLIENT = "vote"

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  /** The raw message from the API -array when it came from validation. */
  readonly detail: string | string[]

  constructor(status: number, code: string, message: string | string[]) {
    super(Array.isArray(message) ? message[0] : message)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.detail = message
  }

  get isNotFound() {
    return this.status === 404
  }

  get isUnauthorized() {
    return this.status === 401
  }

  get isConflict() {
    return this.status === 409
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  /** JSON body -serialized automatically. */
  body?: unknown
  /** Query params appended to the URL, skipping nullish values. */
  query?: Record<string, unknown>
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(
    path.startsWith("http") ? path : `${API_BASE_URL}${path}`,
  )
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (
        (typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean") &&
        value !== ""
      ) {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}

export async function apiRequest<T>(
  path: string,
  { body, query, headers, ...init }: RequestOptions = {},
): Promise<T> {
  // FormData (file uploads) must be passed through untouched so the browser can
  // set the multipart boundary itself — serializing it or forcing a JSON
  // Content-Type would corrupt the request.
  const isFormData = body instanceof FormData

  let response: Response
  try {
    response = await fetch(buildUrl(path, query), {
      credentials: "include",
      ...init,
      headers: {
        "X-Sportly-Client": SPORTLY_CLIENT,
        ...(body !== undefined && !isFormData
          ? { "Content-Type": "application/json" }
          : {}),
        ...headers,
      },
      body:
        body === undefined
          ? undefined
          : isFormData
            ? (body)
            : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      "Can't reach the server. Check your connection and try again.",
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      (payload && (payload.message as string | string[])) ??
      "Something went wrong. Please try again."
    const code = (payload && (payload.code as string)) ?? "UNKNOWN"
    throw new ApiError(response.status, code, message)
  }

  // Success envelope is `{ success, data }`; fall back to the raw body just in
  // case an endpoint isn't wrapped.
  return (payload && "data" in payload ? payload.data : payload) as T
}
