export interface StrategySummary {
  key: string
  replicates: number
  mean: number
  ci95: [number, number]
  min: number
  max: number
  averagePacks: number
  averageBoxes: number
  averageLoose: number
  averageSealedSpend: number
  averageLooseSpend: number
  averageResale: number
}

export interface ResultReplica {
  strategy: string
  seed: number
  netCost: number
}

export interface Improvement {
  reference: string
  evaluated: string
  replicates: number
  meanDollar: number
  ci95Dollar: [number, number]
  rate: number
  ci95Rate: [number, number]
  winRate: number
}

export interface SensitivityPoint {
  parameter: string
  value: number
  boxPrice: number
  commission: number
  boxResaleThreshold: number
  boxProfitableFromResale: boolean
  baselineStrategy: string
  baselineCost: number
  optimalCost: number
  optimalCi95: [number, number]
  averageBoxes: number
  reduction: number | null
  reductionCi95: [number | null, number | null]
}

export interface ResultsData {
  baselineStrategy: string
  strategies: StrategySummary[]
  replicas: ResultReplica[]
  improvements: Improvement[]
  sensitivity: SensitivityPoint[]
}
