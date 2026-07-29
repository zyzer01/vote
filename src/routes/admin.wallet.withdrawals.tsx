import { createFileRoute } from "@tanstack/react-router"

import { Withdrawals } from "@/components/withdrawals"

export const Route = createFileRoute("/admin/wallet/withdrawals")({
  head: () => ({ meta: [{ title: "Withdrawals · Sportly Vote" }] }),
  component: Withdrawals,
})
