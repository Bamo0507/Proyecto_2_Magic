"use client"

import { useArrowKeyNavigation } from "@/features/shared/hooks/useArrowKeyNavigation"
import { useRememberLastSection } from "@/features/shared/hooks/useRememberLastSection"
import type { SectionKey } from "@/i18n/texts"

interface SectionNavigationEffectsProps {
  sectionKey: SectionKey
  previousHref: string
  nextHref: string
}

export function SectionNavigationEffects({ sectionKey, previousHref, nextHref }: SectionNavigationEffectsProps) {
  useRememberLastSection(sectionKey)
  useArrowKeyNavigation(previousHref, nextHref)
  return null
}
