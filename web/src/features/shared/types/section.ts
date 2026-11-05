import type { LucideIcon } from "lucide-react"

import type { SectionKey } from "@/i18n/texts"

export type ManaColor = "white" | "blue" | "black" | "red" | "green" | "colorless" | "gold"

export interface Section {
  key: SectionKey
  href: string
  color: ManaColor
  Icon: LucideIcon
}
