"use client"

import { useEffect, useMemo, useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

import { CardButton } from "@/features/simulation/components/CardButton"
import { selectionOf, type SelectedCard } from "@/features/simulation/components/CardDetailDialog"
import { CardImage } from "@/features/simulation/components/CardImage"
import { fillTemplate } from "@/features/shared/format"
import { newCardsOfBurst, type RunStatus, type Scene } from "@/features/simulation/simulationScenes"
import type { SimulationRun } from "@/features/simulation/types/simulationRun"
import { texts } from "@/i18n/texts"

gsap.registerPlugin(useGSAP)

// The whole box plays in about five seconds whatever its size, with a cap so a short burst does not crawl
const BURST_SECONDS = 4.6
const MAX_SECONDS_PER_PACK = 0.14

interface BoxBurstSceneProps {
  run: SimulationRun
  scene: Extract<Scene, { kind: "burst" }>
  skipToken: number
  onProgress: (status: Partial<RunStatus>) => void
  onComplete: () => void
  onSelectCard?: (card: SelectedCard) => void
}

export function BoxBurstScene({ run, scene, skipToken, onProgress, onComplete, onSelectCard }: BoxBurstSceneProps) {
  const scopeRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLParagraphElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const callbacksRef = useRef({ onProgress, onComplete })
  const step = run.steps[scene.stepIndex]
  const packs = step.packs.slice(scene.firstPackIndex)
  const newCards = useMemo(() => newCardsOfBurst(run, scene), [run, scene])
  const labels = texts.simulation.burst

  useEffect(() => {
    callbacksRef.current = { onProgress, onComplete }
  }, [onProgress, onComplete])

  useGSAP(
    () => {
      const cardElements = gsap.utils.toArray<HTMLElement>("[data-burst-card]")
      gsap.set(cardElements, { opacity: 0, scale: 0.6 })
      const secondsPerPack = Math.min(MAX_SECONDS_PER_PACK, BURST_SECONDS / packs.length)
      const timeline = gsap.timeline({ onComplete: () => callbacksRef.current.onComplete() })

      packs.forEach((pack, offset) => {
        const startsAt = offset * secondsPerPack
        const packNumber = scene.firstPackIndex + offset + 1
        timeline.call(
          () => {
            if (counterRef.current) {
              counterRef.current.textContent = fillTemplate(labels.packCounterTemplate, { current: packNumber, total: step.packs.length })
            }
            callbacksRef.current.onProgress({ missing: pack.missingAfter, packsOpened: step.packsOpenedBefore + packNumber })
          },
          [],
          startsAt
        )
        const packCards = cardElements.filter((element) => element.dataset.pack === String(offset))
        if (packCards.length) {
          timeline.to(packCards, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(1.6)", stagger: 0.012 }, startsAt)
          // The mosaic can be taller than the stage, so the list follows the newest cards while the box plays
          const lastCard = packCards[packCards.length - 1]
          timeline.call(
            () => {
              const list = listRef.current
              if (!list) return
              const overflow = lastCard.offsetTop + lastCard.offsetHeight - list.clientHeight
              if (overflow > list.scrollTop) list.scrollTo({ top: overflow })
            },
            [],
            startsAt
          )
        }
      })

      timelineRef.current = timeline
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) timeline.progress(1)
    },
    { scope: scopeRef }
  )

  useEffect(() => {
    if (skipToken > 0) timelineRef.current?.progress(1)
  }, [skipToken])

  return (
    <div ref={scopeRef} className="flex min-h-0 w-full flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-display text-2xl leading-none font-bold">{fillTemplate(labels.titleTemplate, { box: scene.boxNumber })}</h3>
        <p ref={counterRef} aria-hidden className="nums font-sans text-base font-medium text-muted-foreground">
          {fillTemplate(labels.packCounterTemplate, { current: scene.firstPackIndex, total: step.packs.length })}
        </p>
      </div>
      <p className="font-sans text-base text-muted-foreground">
        {labels.newCardsLabel} ·{" "}
        {fillTemplate(labels.summaryTemplate, { new: newCards.length, opened: packs.length * 14 })}
      </p>
      <ul
        ref={listRef}
        aria-label={labels.newCardsLabel}
        className="relative grid min-h-0 flex-1 auto-rows-min grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] content-start gap-1.5 overflow-y-auto p-1"
      >
        {newCards.map(({ card, packIndex }) => (
          <li key={card.id} data-burst-card data-pack={packIndex}>
            <CardButton
              label={fillTemplate(texts.simulation.cardDetail.openTemplate, { name: run.cards[card.id]?.name ?? card.id })}
              onSelect={onSelectCard && (() => onSelectCard(selectionOf(card, run.cards[card.id])))}
            >
              <CardImage
                cardId={card.id}
                card={run.cards[card.id]}
                size="small"
                backImage={run.cardBack.imageSmall}
                foil={card.foil}
              />
            </CardButton>
          </li>
        ))}
      </ul>
    </div>
  )
}
