"use client"

import { useCallback } from "react"

import { useModelData } from "@/features/model/hooks/useModelData"
import type { ModelData } from "@/features/model/types/modelData"
import { useResultsData } from "@/features/results/hooks/useResultsData"
import type { ResultsData } from "@/features/results/types/resultsData"
import type { PublicJsonState } from "@/features/shared/hooks/usePublicJson"

export interface ProblemData {
  model: ModelData
  results: ResultsData
}

// The problem is told with the same exported numbers the model and results sections show, so it never drifts from them
export function useProblemData() {
  const model = useModelData()
  const results = useResultsData()
  const retryModel = model.retry
  const retryResults = results.retry

  const retry = useCallback(() => {
    retryModel()
    retryResults()
  }, [retryModel, retryResults])

  let state: PublicJsonState<ProblemData>
  if (model.state.status === "error" || results.state.status === "error") state = { status: "error" }
  else if (model.state.status === "ready" && results.state.status === "ready")
    state = { status: "ready", data: { model: model.state.data, results: results.state.data } }
  else state = { status: "loading" }

  return { state, retry }
}
