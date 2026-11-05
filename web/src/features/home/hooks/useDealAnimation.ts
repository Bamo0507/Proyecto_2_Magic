"use client"

import type { RefObject } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

import { LAST_SECTION_KEY, readSessionValue } from "@/features/shared/sessionStore"

gsap.registerPlugin(useGSAP)

export const DEALT_CARD_SELECTOR = "[data-dealt-card]"

const FALLBACK_OFFSET = { x: -420, y: 260 }

// Lives as long as the loaded page: a reload starts it over and deals the full hand, while coming back from a section
// through in-app navigation keeps it, so only the returning card animates
let handDealtInThisPageLoad = false

function centerOf(element: Element) {
  const rect = element.getBoundingClientRect()
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

function offsetFromDeck(card: HTMLElement, deck: HTMLElement | null) {
  if (!deck || deck.getBoundingClientRect().width === 0) return FALLBACK_OFFSET
  const cardCenter = centerOf(card)
  const deckCenter = centerOf(deck)
  const horizontal = deckCenter.x - cardCenter.x
  const vertical = deckCenter.y - cardCenter.y
  // The card lives inside a rotated slot, so the screen distance to the deck is rotated back into the slot's own axes
  const radians = (Number(card.dataset.fanRotation) * Math.PI) / 180
  return {
    x: horizontal * Math.cos(radians) + vertical * Math.sin(radians),
    y: -horizontal * Math.sin(radians) + vertical * Math.cos(radians),
  }
}

export function useDealAnimation(handRef: RefObject<HTMLElement | null>, deckRef: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const cards = Array.from(handRef.current?.querySelectorAll<HTMLElement>(DEALT_CARD_SELECTOR) ?? [])
      if (!cards.length) return

      const media = gsap.matchMedia()
      media.add("(prefers-reduced-motion: no-preference)", () => {
        if (handDealtInThisPageLoad) {
          const lastSection = readSessionValue(LAST_SECTION_KEY)
          const returningCards = cards.filter((card) => card.dataset.sectionKey === lastSection)
          gsap.set(cards, { opacity: 1 })
          gsap.fromTo(returningCards, { y: 48, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" })
          return
        }

        const offsets = cards.map((card) => offsetFromDeck(card, deckRef.current))
        gsap.fromTo(
          cards,
          {
            x: (index: number) => offsets[index].x,
            y: (index: number) => offsets[index].y,
            rotation: (index: number) => -Number(cards[index].dataset.fanRotation),
            scale: 0.4,
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            opacity: 1,
            duration: 0.75,
            ease: "power3.out",
            stagger: 0.07,
            onComplete: () => {
              handDealtInThisPageLoad = true
            },
          }
        )
      })
      return () => media.revert()
    },
    { scope: handRef }
  )
}
