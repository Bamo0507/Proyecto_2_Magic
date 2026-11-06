import type { OpenedCard, SimulationRun } from "@/features/simulation/types/simulationRun"

export type Scene =
  | { kind: "decision"; stepIndex: number }
  | { kind: "pack"; stepIndex: number; boxNumber: number }
  | { kind: "burst"; stepIndex: number; boxNumber: number; firstPackIndex: number }
  | { kind: "closing" }

export interface RunStatus {
  missing: number
  packsOpened: number
  spend: number
}

// The rare slot goes last so the reveal builds up to it, the same order a player flips a real pack
const SLOT_REVEAL_ORDER = [
  "land",
  "foil_land",
  "common",
  "special_guest",
  "new_uncommon",
  "reprint",
  "wildcard",
  "foil_with_showcase",
  "new_rare_mythic",
]

export const HIGHLIGHT_SLOT = "new_rare_mythic"

// Reordering can put a repeated copy before the new copy of the same card, so "new" is reassigned to whichever copy
// is flipped first
export function revealOrder(cards: OpenedCard[]) {
  const rankOf = (slot: string) => {
    const rank = SLOT_REVEAL_ORDER.indexOf(slot)
    return rank === -1 ? SLOT_REVEAL_ORDER.length - 1 : rank
  }
  const newIds = new Set(cards.filter((card) => card.isNew).map((card) => card.id))
  const flippedIds = new Set<string>()
  return [...cards]
    .sort((first, second) => rankOf(first.slot) - rankOf(second.slot))
    .map((card) => {
      const isNew = newIds.has(card.id) && !flippedIds.has(card.id)
      flippedIds.add(card.id)
      return { ...card, isNew }
    })
}

// Only the very first pack of the run is opened card by card; every box after that plays as a fast burst
export function buildScenes(run: SimulationRun): Scene[] {
  const scenes: Scene[] = []
  let boxNumber = 0
  let detailedPackShown = false

  run.steps.forEach((step, stepIndex) => {
    scenes.push({ kind: "decision", stepIndex })
    if (step.action === "stop") {
      scenes.push({ kind: "closing" })
      return
    }
    boxNumber += 1
    if (!detailedPackShown) {
      scenes.push({ kind: "pack", stepIndex, boxNumber })
      detailedPackShown = true
      if (step.packs.length === 1) return
      scenes.push({ kind: "burst", stepIndex, boxNumber, firstPackIndex: 1 })
      return
    }
    scenes.push({ kind: "burst", stepIndex, boxNumber, firstPackIndex: 0 })
  })
  return scenes
}

function productPrice(run: SimulationRun, stepIndex: number) {
  const action = run.steps[stepIndex].action
  return action === "stop" ? 0 : run.products[action].price
}

function spendBefore(run: SimulationRun, stepIndex: number) {
  let spend = 0
  for (let index = 0; index < stepIndex; index += 1) spend += productPrice(run, index)
  return spend
}

function statusAtPack(run: SimulationRun, stepIndex: number, packsDone: number): RunStatus {
  const step = run.steps[stepIndex]
  return {
    missing: packsDone === 0 ? step.missingBefore : step.packs[packsDone - 1].missingAfter,
    packsOpened: step.packsOpenedBefore + packsDone,
    spend: spendBefore(run, stepIndex) + productPrice(run, stepIndex),
  }
}

export function statusBefore(run: SimulationRun, scene: Scene): RunStatus {
  if (scene.kind === "closing") return statusAfter(run, scene)
  if (scene.kind === "decision") {
    const step = run.steps[scene.stepIndex]
    return { missing: step.missingBefore, packsOpened: step.packsOpenedBefore, spend: spendBefore(run, scene.stepIndex) }
  }
  if (scene.kind === "pack") return statusAtPack(run, scene.stepIndex, 0)
  return statusAtPack(run, scene.stepIndex, scene.firstPackIndex)
}

export function statusAfter(run: SimulationRun, scene: Scene): RunStatus {
  if (scene.kind === "closing") {
    const lastStep = run.steps[run.steps.length - 1]
    return { missing: lastStep.missingBefore, packsOpened: lastStep.packsOpenedBefore, spend: run.closing.sealedSpend }
  }
  if (scene.kind === "decision") return statusBefore(run, scene)
  if (scene.kind === "pack") return statusAtPack(run, scene.stepIndex, 1)
  return statusAtPack(run, scene.stepIndex, run.steps[scene.stepIndex].packs.length)
}

export function newCardsOfBurst(run: SimulationRun, scene: Extract<Scene, { kind: "burst" }>) {
  return run.steps[scene.stepIndex].packs.slice(scene.firstPackIndex).flatMap((pack, offset) =>
    pack.cards.filter((card) => card.isNew).map((card) => ({ card, packIndex: offset }))
  )
}

export function imagesForScene(run: SimulationRun, scene: Scene | undefined) {
  if (!scene || scene.kind === "decision") return []
  const pick = (ids: string[], size: "imageSmall" | "imageNormal") =>
    ids.map((id) => run.cards[id]?.[size]).filter((url): url is string => Boolean(url))
  if (scene.kind === "closing") return pick(run.closing.missingCards, "imageSmall")
  if (scene.kind === "pack") {
    const cardImages = pick(run.steps[scene.stepIndex].packs[0].cards.map((card) => card.id), "imageNormal")
    const extras = [run.products.pack.image, run.cardBack.imageNormal].filter((url): url is string => Boolean(url))
    return [...extras, ...cardImages]
  }
  const burstImages = pick(newCardsOfBurst(run, scene).map(({ card }) => card.id), "imageSmall")
  return run.cardBack.imageSmall ? [run.cardBack.imageSmall, ...burstImages] : burstImages
}

export const isAnimatedScene = (scene: Scene) => scene.kind === "pack" || scene.kind === "burst"
