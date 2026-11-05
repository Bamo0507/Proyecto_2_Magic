"use client"

import { useRouter } from "next/navigation"
import { useCallback, useRef, type MouseEvent, type RefObject } from "react"
import gsap from "gsap"

const DRAW_DURATION_SECONDS = 0.35

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

export function useDrawCard(href: string, topCardRef: RefObject<HTMLElement | null>) {
  const router = useRouter()
  const isDrawing = useRef(false)

  return useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      const topCard = topCardRef.current
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      if (event.defaultPrevented || !isPlainLeftClick(event) || !topCard || prefersReducedMotion) return

      event.preventDefault()
      if (isDrawing.current) return
      isDrawing.current = true
      router.prefetch(href)
      gsap.to(topCard, { yPercent: 130, rotation: 8, opacity: 0, duration: DRAW_DURATION_SECONDS, ease: "power2.in" })
      // Navigation runs on its own timer so a stalled animation (background tab, slow device) can never block it
      window.setTimeout(() => router.push(href), DRAW_DURATION_SECONDS * 1000)
    },
    [href, router, topCardRef]
  )
}
