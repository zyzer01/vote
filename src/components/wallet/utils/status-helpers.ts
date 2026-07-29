import type { VariantProps } from "class-variance-authority"
import { badgeVariants } from "@/components/ui/badge"

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"]

/**
 * Status helper functions for wallet components
 * Returns appropriate badge variants based on status values
 */

export function getTransactionTypeBadgeVariant(type: string): BadgeVariant {
  switch (type) {
    case "CREDIT":
      return "default" // green
    case "DEBIT":
      return "destructive" // red
    default:
      return "secondary"
  }
}

export function getBankAccountStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "VERIFIED":
      return "default" // green
    case "PENDING":
      return "secondary" // yellow/gray
    case "FAILED":
      return "destructive" // red
    default:
      return "secondary"
  }
}

export function getWalletStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "ACTIVE":
      return "default" // green
    case "SUSPENDED":
      return "secondary" // yellow/gray
    case "CLOSED":
      return "destructive" // red
    default:
      return "secondary"
  }
}
