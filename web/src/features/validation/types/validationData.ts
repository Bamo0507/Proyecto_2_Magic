export type Interval = [number, number]

export interface RealReference {
  source: string
  url: string
  date: string
  currency: string
  priceOriginal: number
  exchangeRate: number
  priceUsd: number
  offers: number | null
  cardsIncluded: number | null
  baseSetSize: number
}

export interface RealComparisonRow {
  key: "referencia_real" | "modelo_base" | "modelo_mejorado"
  strategy: string
  cost: number
  ci95: Interval | null
  changeVsBase: number
  changeRateVsBase: number
}

export interface CouponCollectorCheck {
  replicates: number
  formulaMean: number
  formulaSd: number
  simulatedMean: number
  simulatedSd: number
  ci95: Interval
  relativeError: number
}

export interface RarityCheck {
  key: "rara" | "mitica" | "variante"
  packs: number
  simulatedRate: number
  ci95: Interval
  dataRate: number
  officialRate: number
  relativeError: number
}

export interface PerCardCheck {
  packs: number
  cards: number
  shareInsideCi: number
  meanRelativeError: number
  maxRelativeError: number
  expectedSale: number
  simulatedSale: number
  saleCi95: Interval
  saleRelativeError: number
}

export interface ConsistencyCheck {
  test: string
  cases: number
  failures: number
}

export interface ValidationData {
  realReference: RealReference | null
  realComparison: RealComparisonRow[]
  couponCollector: CouponCollectorCheck
  rarity: RarityCheck[]
  perCard: PerCardCheck
  consistency: ConsistencyCheck[]
}

// The few figures of results.json that the conclusions quote; the full shape belongs to the results feature
export interface StrategyCost {
  key: string
  mean: number
}

export interface StrategyImprovement {
  reference: string
  rate: number
}

export interface ResultsSummary {
  baselineStrategy: string
  strategies: StrategyCost[]
  improvements: StrategyImprovement[]
}
