"use client"

import { useCallback, useEffect, useEffectEvent, useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, FastForward, Maximize2, Minimize2, PackageOpen, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { BoxBurstScene } from "@/features/simulation/components/BoxBurstScene"
import { CardDetailDialog, type SelectedCard } from "@/features/simulation/components/CardDetailDialog"
import { ClosingScene } from "@/features/simulation/components/ClosingScene"
import { DecisionScene } from "@/features/simulation/components/DecisionScene"
import { PackOpeningScene } from "@/features/simulation/components/PackOpeningScene"
import { RunStatusBar } from "@/features/simulation/components/RunStatusBar"
import { fillTemplate } from "@/features/simulation/format"
import { usePreloadImages } from "@/features/simulation/hooks/usePreloadImages"
import {
  buildScenes,
  imagesForScene,
  statusAfter,
  statusBefore,
  type RunStatus,
  type Scene,
} from "@/features/simulation/simulationScenes"
import type { SimulationRun } from "@/features/simulation/types/simulationRun"
import { texts } from "@/i18n/texts"

interface SimulationPlayerProps {
  run: SimulationRun
  expanded: boolean
  onToggleExpanded: () => void
}

const FORWARD_KEYS = new Set(["ArrowRight", "PageDown", " ", "Enter"])
const BACKWARD_KEYS = new Set(["ArrowLeft", "PageUp"])

function initialStatus(run: SimulationRun, scene: Scene) {
  return scene.kind === "pack" || scene.kind === "burst" ? statusBefore(run, scene) : statusAfter(run, scene)
}

export function SimulationPlayer({ run, expanded, onToggleExpanded }: SimulationPlayerProps) {
  const scenes = useMemo(() => buildScenes(run), [run])
  const [sceneIndex, setSceneIndex] = useState(0)
  const [packOpened, setPackOpened] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [skipToken, setSkipToken] = useState(0)
  const [status, setStatus] = useState<RunStatus>(() => initialStatus(run, scenes[0]))
  const [selectedCard, setSelectedCard] = useState<SelectedCard | null>(null)
  const scene = scenes[sceneIndex]
  const labels = texts.simulation

  usePreloadImages(imagesForScene(run, scene))
  usePreloadImages(imagesForScene(run, scenes[sceneIndex + 1]))

  const goTo = useCallback(
    (index: number) => {
      const target = scenes[index]
      setSceneIndex(index)
      setPackOpened(false)
      setSkipToken(0)
      setIsAnimating(target.kind === "burst")
      setStatus(initialStatus(run, target))
    },
    [run, scenes]
  )

  const handleProgress = useCallback((partial: Partial<RunStatus>) => {
    setStatus((current) => ({ ...current, ...partial }))
  }, [])

  const handleComplete = useCallback(() => {
    setIsAnimating(false)
    setStatus(statusAfter(run, scene))
  }, [run, scene])

  const canGoBack = sceneIndex > 0 && !isAnimating

  function handlePrevious() {
    if (canGoBack) goTo(sceneIndex - 1)
  }

  function handlePrimary() {
    if (isAnimating) {
      setSkipToken((current) => current + 1)
      return
    }
    if (scene.kind === "pack" && !packOpened) {
      setPackOpened(true)
      setIsAnimating(true)
      return
    }
    goTo(scene.kind === "closing" ? 0 : sceneIndex + 1)
  }

  // While the stage is expanded it owns the keyboard, so a presentation clicker drives the run instead of changing
  // sections; the listener runs in the capture phase and marks the event handled before the section navigation sees it
  const handleStageKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return
    // The card detail handles its own keys, Escape included, so the stage stays out of the way while it is open
    if (selectedCard) return
    const onButton = event.target instanceof Element && event.target.closest("button")
    if (event.key === "Escape") {
      event.preventDefault()
      onToggleExpanded()
      return
    }
    if (FORWARD_KEYS.has(event.key)) {
      event.preventDefault()
      if (onButton && (event.key === " " || event.key === "Enter")) return
      handlePrimary()
      return
    }
    if (BACKWARD_KEYS.has(event.key)) {
      event.preventDefault()
      handlePrevious()
    }
  })

  useEffect(() => {
    if (!expanded) return
    const listener = (event: KeyboardEvent) => handleStageKey(event)
    window.addEventListener("keydown", listener, { capture: true })
    return () => window.removeEventListener("keydown", listener, { capture: true })
  }, [expanded])

  const selectCard = isAnimating ? undefined : setSelectedCard

  const primary = isAnimating
    ? { label: labels.skip, Icon: FastForward }
    : scene.kind === "pack" && !packOpened
      ? { label: labels.openPack, Icon: PackageOpen }
      : scene.kind === "closing"
        ? { label: labels.restart, Icon: RotateCcw }
        : { label: labels.next, Icon: ArrowRight }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <RunStatusBar
        run={run}
        status={status}
        action={
          <Button
            variant="outline"
            size="icon-lg"
            onClick={onToggleExpanded}
            aria-label={expanded ? labels.collapse : labels.expand}
            title={expanded ? labels.collapse : labels.expand}
          >
            {expanded ? <Minimize2 /> : <Maximize2 />}
          </Button>
        }
      />

      <div key={sceneIndex} className="relative flex min-h-0 flex-1 flex-col md:[container-type:size]">
        {scene.kind === "decision" && <DecisionScene run={run} stepIndex={scene.stepIndex} />}
        {scene.kind === "pack" && (
          <PackOpeningScene
            run={run}
            scene={scene}
            isPlaying={packOpened}
            skipToken={skipToken}
            onProgress={handleProgress}
            onComplete={handleComplete}
            onSelectCard={selectCard}
          />
        )}
        {scene.kind === "burst" && (
          <BoxBurstScene
            run={run}
            scene={scene}
            skipToken={skipToken}
            onProgress={handleProgress}
            onComplete={handleComplete}
            onSelectCard={selectCard}
          />
        )}
        {scene.kind === "closing" && <ClosingScene run={run} onSelectCard={selectCard} />}
      </div>

      <CardDetailDialog run={run} selected={selectedCard} onClose={() => setSelectedCard(null)} />

      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="lg" onClick={handlePrevious} disabled={!canGoBack}>
          <ArrowLeft data-icon="inline-start" />
          {labels.previous}
        </Button>
        <p className="nums text-center font-sans text-sm text-muted-foreground">
          {fillTemplate(labels.progressTemplate, { current: sceneIndex + 1, total: scenes.length })}
          {expanded && <span className="hidden md:inline"> · {labels.keyboardHint}</span>}
        </p>
        <Button size="lg" onClick={handlePrimary}>
          {primary.label}
          <primary.Icon data-icon="inline-end" />
        </Button>
      </div>
    </div>
  )
}
