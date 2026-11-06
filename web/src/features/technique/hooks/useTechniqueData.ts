"use client"

import { usePublicJson } from "@/features/shared/hooks/usePublicJson"
import type { TechniqueData } from "@/features/technique/types/techniqueData"

export function useTechniqueData() {
  return usePublicJson<TechniqueData>("/data/technique.json")
}
