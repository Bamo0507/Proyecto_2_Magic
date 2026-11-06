export type CardCategory = "common" | "uncommon" | "rare" | "mythic" | "outOfSet"

export interface Composition {
  cardsBySlot: Record<string, number>
  probability: number
}

export interface SlotPool {
  name: string
  entries: number
  distinctCards: number
  baseSetCards: number
  outOfSetCards: number
  allFoil: boolean
  averagePerPack: number
  categoryMix: Partial<Record<CardCategory, number>>
}

export interface RareSlotCategory {
  key: "rara" | "mitica" | "variante"
  dataRate: number
  officialRate: number
}

export interface MarketExample {
  marketPrice: number
  buyPrice: number
  commission: number
  processing: number
  fixedFee: number
  saleNet: number
  sells: boolean
}

export interface ProductInfo {
  price: number
  packs: number
  pricePerPack: number
  url: string
}

export interface ModelData {
  setName: string
  pricesDate: string
  baseSetSize: number
  baseSetByRarity: Record<string, number>
  compositions: Composition[]
  slots: SlotPool[]
  rareSlot: {
    slot: string
    totalWeight: number
    categories: RareSlotCategory[]
    officialSource: string
    example: { id: string; name: string; weight: number; probability: number; image: string | null }
  }
  probabilityByRarity: Record<string, { cards: number; probabilityPerPack: number; packsPerCopy: number }>
  duplicates: { packsSimulated: number; anyFinishShare: number; bothNormalShare: number }
  products: Record<"pack" | "box", ProductInfo>
  market: {
    minimumBuyPrice: number
    freeShippingFrom: number
    shippingCost: number
    commissionRate: number
    commissionCap: number
    processingRate: number
    fixedFeePerOrder: number
    cardsPerOrder: number
    examples: MarketExample[]
  }
  sources: {
    scryfall: string
    composition: string
    wizards: string
    tcgplayerPack: string
    tcgplayerBox: string
    sealedPricesDate: string
  }
}
