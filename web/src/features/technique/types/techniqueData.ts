export type TechniqueAction = "stop" | "pack" | "box"

export interface GainBreakdown {
  expectedSale: number
  missingSavings: number
  price: number
  gain: number
}

export interface TechniqueDecision {
  missingBefore: number
  packsOpenedBefore: number
  pack: GainBreakdown
  box: GainBreakdown
  action: TechniqueAction
}

export interface TechniqueData {
  seed: number
  baseSetSize: number
  expectedSalePerPack: number
  products: Record<"pack" | "box", { price: number; packs: number }>
  boxThresholdPrice: number
  decisions: TechniqueDecision[]
  exampleCard: {
    id: string
    name: string
    image: string | null
    probabilityPerPack: number
    probabilityPerBox: number
    buyPrice: number
    keptCopySale: number
    savings: number
  }
  averageProbabilityPerPack: { common: number; mythic: number }
}
