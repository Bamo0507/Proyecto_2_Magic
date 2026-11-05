"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

const EDITABLE_SELECTOR = "input, textarea, select, [contenteditable='true']"

export function useArrowKeyNavigation(previousHref: string, nextHref: string) {
  const router = useRouter()

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (event.target instanceof Element && event.target.closest(EDITABLE_SELECTOR)) return
      if (event.key === "ArrowLeft") router.push(previousHref)
      if (event.key === "ArrowRight") router.push(nextHref)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router, previousHref, nextHref])
}
