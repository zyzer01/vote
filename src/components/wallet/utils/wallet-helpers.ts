export function getBankAccountStatusLabel(status: string): string {
  switch (status) {
    case "VERIFIED":
      return "Verified"
    case "PENDING":
      return "Pending"
    case "FAILED":
      return "Failed"
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  }
}
