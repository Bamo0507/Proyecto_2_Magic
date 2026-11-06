"use client"

import { useEffect, useMemo, useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

import { CardBadges } from "@/features/simulation/components/CardBadges"
import { CardButton } from "@/features/simulation/components/CardButton"
import { selectionOf, type SelectedCard } from "@/features/simulation/components/CardDetailDialog"
import { CardImage } from "@/features/simulation/components/CardImage"
import { MagicCardBack } from "@/features/simulation/components/MagicCardBack"
import { SealedPack } from "@/features/simulation/components/SealedPack"
import { fillTemplate } from "@/features/shared/format"
import { HIGHLIGHT_SLOT, revealOrder, type RunStatus, type Scene } from "@/features/simulation/simulationScenes"
import type { SimulationRun } from "@/features/simulation/types/simulationRun"
import { texts } from "@/i18n/texts"

gsap.registerPlugin(useGSAP)

const FLIP_GAP_SECONDS = 0.22
const HIGHLIGHT_PAUSE_SECONDS = 0.5

interface PackOpeningSceneProps {
  run: SimulationRun
  scene: Extract<Scene, { kind: "pack" }>
  isPlaying: boolean
  skipToken: number
  onProgress: (status: Partial<RunStatus>) => void
  onComplete: () => void
  onSelectCard?: (card: SelectedCard) => void
}

export function PackOpeningScene({
  run,
  scene,
  isPlaying,
  skipToken,
  onProgress,
  onComplete,
  onSelectCard,
}: PackOpeningSceneProps) {
  const scopeRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const callbacksRef = useRef({ onProgress, onComplete })
  const step = run.steps[scene.stepIndex]
  const cards = useMemo(() => revealOrder(step.packs[0].cards), [step])
  const newCount = cards.filter((card) => card.isNew).length

  useEffect(() => {
    callbacksRef.current = { onProgress, onComplete }
  }, [onProgress, onComplete])

  useGSAP(
    () => {
      if (!isPlaying) return
      const slots = gsap.utils.toArray<HTMLElement>("[data-reveal-card]")
      const flips = gsap.utils.toArray<HTMLElement>("[data-flip]")
      const badges = gsap.utils.toArray<HTMLElement>("[data-badges]")
      gsap.set(flips, { rotationY: 180 })
      gsap.set(badges, { opacity: 0 })

      const timeline = gsap.timeline({ onComplete: () => callbacksRef.current.onComplete() })
      timeline
        .to("[data-pack-strip]", { xPercent: 30, yPercent: -70, rotation: -14, opacity: 0, duration: 0.45, ease: "power2.in" })
        .to("[data-pack-body]", { yPercent: 35, scale: 0.92, opacity: 0, duration: 0.4, ease: "power2.in" }, "-=0.1")
        .from(slots, { opacity: 0, y: 48, scale: 0.85, duration: 0.45, ease: "power3.out", stagger: 0.035 }, "-=0.15")
        .addLabel("reveal")

      let missing = step.missingBefore
      let cursor = 0
      cards.forEach((card, index) => {
        if (card.isNew) missing -= 1
        const missingAfterFlip = missing
        const reportProgress = () => callbacksRef.current.onProgress({ missing: missingAfterFlip, packsOpened: step.packsOpenedBefore + 1 })

        if (card.slot === HIGHLIGHT_SLOT) {
          const liftAt = cursor + HIGHLIGHT_PAUSE_SECONDS
          timeline
            .to(slots[index], { y: -14, scale: 1.08, duration: 0.3, ease: "power2.out" }, `reveal+=${liftAt}`)
            .to(flips[index], { rotationY: 0, duration: 0.6, ease: "power3.out", onStart: reportProgress }, `reveal+=${liftAt + 0.15}`)
            .to(badges[index], { opacity: 1, duration: 0.2 }, `reveal+=${liftAt + 0.6}`)
            .to(slots[index], { y: 0, scale: 1, duration: 0.35, ease: "power2.inOut" }, `reveal+=${liftAt + 1.1}`)
          cursor = liftAt + 1.1
          return
        }
        timeline
          .to(flips[index], { rotationY: 0, duration: 0.36, ease: "power2.out", onStart: reportProgress }, `reveal+=${cursor}`)
          .to(badges[index], { opacity: 1, duration: 0.2 }, `reveal+=${cursor + 0.28}`)
        cursor += FLIP_GAP_SECONDS
      })

      timelineRef.current = timeline
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) timeline.progress(1)
    },
    { scope: scopeRef, dependencies: [isPlaying] }
  )

  useEffect(() => {
    if (skipToken > 0) timelineRef.current?.progress(1)
  }, [skipToken])

  return (
    <div ref={scopeRef} className="relative flex min-h-[24rem] w-full flex-1 flex-col items-center justify-center gap-3 md:min-h-0">
      <p className="font-display text-lg font-bold md:absolute md:top-0 md:left-0">
        {fillTemplate(texts.simulation.pack.titleTemplate, { box: scene.boxNumber })}
        {isPlaying && (
          <span className="ml-2 font-sans text-base font-medium text-muted-foreground">
            {fillTemplate(texts.simulation.pack.summaryTemplate, { new: newCount })}
          </span>
        )}
      </p>

      <div className="pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
        <div className="aspect-[525/1000] w-36 sm:w-40 md:h-[min(72cqh,28rem)] md:w-auto">
          <SealedPack imageUrl={run.products.pack.image} className="size-full" />
        </div>
        {!isPlaying && run.products.pack.image && (
          <p className="font-sans text-sm text-muted-foreground">{texts.simulation.sealedPack.credit}</p>
        )}
      </div>

      {isPlaying && (
        <ol className="grid w-full grid-cols-4 gap-x-2 gap-y-3 sm:grid-cols-7 md:mt-7 md:max-w-[calc(2.5*(100cqh-6rem)+4.5rem)]">
          {cards.map((opened, index) => (
            <li key={`${opened.id}-${index}`} data-reveal-card className="flex flex-col items-center gap-1.5">
              <CardButton
                label={fillTemplate(texts.simulation.cardDetail.openTemplate, { name: run.cards[opened.id]?.name ?? opened.id })}
                onSelect={onSelectCard && (() => onSelectCard(selectionOf(opened, run.cards[opened.id])))}
                className="perspective-[1200px]"
              >
                <div data-flip className="relative w-full transform-3d">
                  <CardImage
                    cardId={opened.id}
                    card={run.cards[opened.id]}
                    size="normal"
                    backImage={run.cardBack.imageNormal}
                    foil={opened.foil}
                    className="w-full backface-hidden"
                  />
                  <MagicCardBack
                    imageUrl={run.cardBack.imageNormal}
                    className="absolute inset-0 size-full shadow-card backface-hidden rotate-y-180"
                  />
                </div>
              </CardButton>
              <span data-badges>
                <CardBadges opened={opened} card={run.cards[opened.id]} />
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
