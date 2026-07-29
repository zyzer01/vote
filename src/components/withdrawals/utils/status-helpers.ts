import type { VariantProps } from "class-variance-authority"
import { badgeVariants } from "@/components/ui/badge"

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"]

/**
 * Status helper functions for withdrawal components
 * Returns appropriate badge variants based on withdrawal status values
 */

export function getWithdrawalStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "COMPLETED":
      return "default" // green
    case "PROCESSING":
      return "default" // blue (could be customized)
    case "PENDING":
      return "secondary" // yellow/gray
    case "FAILED":
      return "destructive" // red
    case "CANCELLED":
      return "outline" // gray
    default:
      return "secondary"
  }
}

export function getWithdrawalStatusColor(status: string): string {
  switch (status) {
    case "COMPLETED":
      return "text-green-600 dark:text-green-400"
    case "PROCESSING":
      return "text-blue-600 dark:text-blue-400"
    case "PENDING":
      return "text-yellow-600 dark:text-yellow-400"
    case "FAILED":
      return "text-red-600 dark:text-red-400"
    case "CANCELLED":
      return "text-gray-600 dark:text-gray-400"
    default:
      return "text-gray-600 dark:text-gray-400"
  }
}

export function getWithdrawalStatusLabel(status: string): string {
  switch (status) {
    case "COMPLETED":
      return "Completed"
    case "PROCESSING":
      return "Processing"
    case "PENDING":
      return "Pending"
    case "FAILED":
      return "Failed"
    case "CANCELLED":
      return "Cancelled"
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  }
}
