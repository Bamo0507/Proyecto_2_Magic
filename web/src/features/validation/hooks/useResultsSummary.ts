"use client"

import { usePublicJson } from "@/features/shared/hooks/usePublicJson"
import type { ResultsSummary } from "@/features/validation/types/validationData"

export function useResultsSummary() {
  return usePublicJson<ResultsSummary>("/data/results.json")
}
