"use client"

import { useEffect } from "react"

import { LAST_SECTION_KEY, writeSessionValue } from "@/features/shared/sessionStore"
import type { SectionKey } from "@/i18n/texts"

export function useRememberLastSection(sectionKey: SectionKey) {
  useEffect(() => {
    writeSessionValue(LAST_SECTION_KEY, sectionKey)
  }, [sectionKey])
}
