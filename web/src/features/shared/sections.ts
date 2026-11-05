import { ChartColumn, Dices, Hourglass, Network, Puzzle, Scale, Target } from "lucide-react"

import type { Section } from "@/features/shared/types/section"
import { texts, type SectionKey } from "@/i18n/texts"

export const SECTIONS: Section[] = [
  { key: "problem", href: "/problem", color: "white", Icon: Puzzle },
  { key: "objectives", href: "/objectives", color: "blue", Icon: Target },
  { key: "model", href: "/model", color: "green", Icon: Network },
  { key: "technique", href: "/technique", color: "black", Icon: Hourglass },
  { key: "simulation", href: "/simulation", color: "red", Icon: Dices },
  { key: "results", href: "/results", color: "gold", Icon: ChartColumn },
  { key: "validation", href: "/validation", color: "colorless", Icon: Scale },
]

export function getSection(key: SectionKey) {
  const index = SECTIONS.findIndex((section) => section.key === key)
  return {
    section: SECTIONS[index],
    position: index + 1,
    previousSection: SECTIONS[(index - 1 + SECTIONS.length) % SECTIONS.length],
    nextSection: SECTIONS[(index + 1) % SECTIONS.length],
  }
}


export function formatSectionPosition(position: number) {
  return texts.section.positionTemplate
    .replace("{position}", String(position))
    .replace("{total}", String(SECTIONS.length))
}
