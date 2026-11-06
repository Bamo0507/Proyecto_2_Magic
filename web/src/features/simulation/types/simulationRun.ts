export type SimulationAction = "stop" | "pack" | "box"

export interface OpenedCard {
  id: string
  foil: boolean
  slot: string
  isNew: boolean
}

export interface OpenedPack {
  cards: OpenedCard[]
  missingAfter: number
}

export interface SimulationStep {
  action: SimulationAction
  missingBefore: number
  packsOpenedBefore: number
  expectedGain: Record<SimulationAction, number>
  packs: OpenedPack[]
}

export interface CardInfo {
  name: string
  rarity: string
  price: number
  foilPrice: number
  buyPrice: number | null
  inBaseSet: boolean
  imageSmall: string | null
  imageNormal: string | null
}

export interface SealedProduct {
  price: number
  packs: number
  image: string | null
}

export interface SimulationRun {
  seed: number
  setName: string
  pricesDate: string
  baseSetSize: number
  products: Record<"pack" | "box", SealedProduct>
  expectedSalePerPack: number
  cardBack: { imageSmall: string | null; imageNormal: string | null }
  steps: SimulationStep[]
  closing: {
    missingCards: string[]
    looseCost: number
    sealedSpend: number
    saleIncome: number
    netCost: number
    buyAllLooseCost: number
  }
  cards: Record<string, CardInfo>
}
