/**
 * Public platform-config API. Only the payments namespace is exposed to the
 * frontend today; unlike voting.ts this is not under the /v1/voting/public
 * prefix.
 */
import { apiRequest } from "./client"
import type { PaymentGatewayConfig } from "./types"

export function getPaymentGatewayConfig(app: "arena" | "vote") {
  return apiRequest<PaymentGatewayConfig>(`/v1/config/payments/${app}`)
}
