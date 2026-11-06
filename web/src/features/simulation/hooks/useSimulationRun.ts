"use client"

import { useCallback, useEffect, useState } from "react"

import type { SimulationRun } from "@/features/simulation/types/simulationRun"

const SIMULATION_RUN_URL = "/data/simulation-run.json"

type RunState = { status: "loading" } | { status: "error" } | { status: "ready"; run: SimulationRun }

export function useSimulationRun() {
  const [state, setState] = useState<RunState>({ status: "loading" })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetch(SIMULATION_RUN_URL, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<SimulationRun>
      })
      .then((run) => setState({ status: "ready", run }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "error" })
      })
    return () => controller.abort()
  }, [attempt])

  const retry = useCallback(() => {
    setState({ status: "loading" })
    setAttempt((current) => current + 1)
  }, [])

  return { state, retry }
}
