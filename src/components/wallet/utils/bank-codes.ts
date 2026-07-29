/**
 * Nigerian bank codes and names
 *
 * @deprecated This hardcoded list is deprecated. Use the `useBanks` hook from
 * `../hooks/use-bank-accounts` to fetch banks dynamically from the API instead.
 * This file is kept for backward compatibility only.
 */

export const NIGERIAN_BANKS = [
  { code: "044", name: "Access Bank Nigeria Plc" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "058", name: "Guaranty Trust Bank" },
  { code: "033", name: "United Bank for Africa" },
  { code: "057", name: "Zenith Bank" },
  { code: "023", name: "Citibank Nigeria" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "070", name: "Fidelity Bank Nigeria" },
  { code: "214", name: "First City Monument Bank" },
  { code: "030", name: "Heritage Bank" },
  { code: "301", name: "Jaiz Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "068", name: "Standard Chartered Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "100", name: "Suntrust Bank" },
  { code: "032", name: "Union Bank of Nigeria" },
  { code: "215", name: "Unity Bank" },
  { code: "035", name: "Wema Bank" },
] as const

export function getBankName(bankCode: string): string {
  const bank = NIGERIAN_BANKS.find((b) => b.code === bankCode)
  return bank?.name || "Unknown Bank"
}

export function getBankOptions() {
  return NIGERIAN_BANKS.map((bank) => ({
    value: bank.code,
    label: bank.name,
  }))
}
