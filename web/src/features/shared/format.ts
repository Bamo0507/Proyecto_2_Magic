const MONEY_FORMAT = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
const SIGNED_MONEY_FORMAT = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", signDisplay: "exceptZero" })
const PERCENT_FORMAT = new Intl.NumberFormat("es-GT", { style: "percent", maximumFractionDigits: 1 })
// Rates such as a 10.75% commission or a 0.64% chance lose their meaning when rounded to one decimal
const PRECISE_PERCENT_FORMAT = new Intl.NumberFormat("es-GT", { style: "percent", maximumFractionDigits: 2 })

export function formatMoney(amount: number) {
  return MONEY_FORMAT.format(amount)
}

export function formatSignedMoney(amount: number) {
  return SIGNED_MONEY_FORMAT.format(amount)
}

export function formatPercent(ratio: number) {
  return PERCENT_FORMAT.format(ratio)
}

export function formatPrecisePercent(ratio: number) {
  return PRECISE_PERCENT_FORMAT.format(ratio)
}

export function fillTemplate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}
