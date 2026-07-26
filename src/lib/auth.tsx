import { createContext, useContext } from "react"

import type { AuthUser } from "./api/admin-types"

export interface AuthContextValue {
  user: AuthUser
  /** The organization the dashboard is scoped to. */
  organizationId: string
  organizationName: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = AuthContext.Provider

/** Read the authenticated admin + active organization. Only valid under the dashboard shell. */
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error("useAuth must be used within the dashboard shell")
  }
  return value
}

export function fullName(user: AuthUser): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
  return name || user.email
}

export function initials(user: AuthUser): string {
  const first = user.firstName?.[0] ?? user.email[0]
  const last = user.lastName?.[0] ?? ""
  return `${first}${last}`.toUpperCase() || "U"
}
