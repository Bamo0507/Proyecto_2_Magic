"use client"

import { useCallback, useEffect, useState } from "react"

export type PublicJsonState<Data> = { status: "loading" } | { status: "error" } | { status: "ready"; data: Data }

// Reads a JSON file exported by the Python pipeline into web/public/data, with loading, error and retry states
export function usePublicJson<Data>(url: string) {
  const [state, setState] = useState<PublicJsonState<Data>>({ status: "loading" })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<Data>
      })
      .then((data) => setState({ status: "ready", data }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "error" })
      })
    return () => controller.abort()
  }, [url, attempt])

  const retry = useCallback(() => {
    setState({ status: "loading" })
    setAttempt((current) => current + 1)
  }, [])

  return { state, retry }
}
