"use client"

import { usePublicJson } from "@/features/shared/hooks/usePublicJson"
import type { SimulationRun } from "@/features/simulation/types/simulationRun"

export function useSimulationRun() {
  return usePublicJson<SimulationRun>("/data/simulation-run.json")
}
