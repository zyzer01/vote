import { createFileRoute } from "@tanstack/react-router"

import { Wallet } from "@/components/wallet"

export const Route = createFileRoute("/admin/wallet/")({
  head: () => ({ meta: [{ title: "Wallet · Sportly Vote" }] }),
  component: Wallet,
})
