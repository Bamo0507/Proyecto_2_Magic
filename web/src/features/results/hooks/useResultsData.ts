"use client"

import { usePublicJson } from "@/features/shared/hooks/usePublicJson"
import type { ResultsData } from "@/features/results/types/resultsData"

export function useResultsData() {
  return usePublicJson<ResultsData>("/data/results.json")
}
