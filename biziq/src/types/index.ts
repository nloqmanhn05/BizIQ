export interface ParsedCSVData {
  totalRevenueRM: number
  totalCogsRM: number
  totalGrossProfitRM: number
  grossMarginPct: number
  avgMonthlyRevenueRM: number
  totalTransactions: number
  dateRange: string
  numLocations: number
  avgRevenuePerLocationRM: number
  cogsAsRevenueRatioPct: number
  yoyGrowthPct: number
  avgDiscountPct: number
  revenueByLocation: Record<string, number>
  revenueByChannel: Record<string, number>
  revenueByItem: Record<string, number>
  revenueByDayOfWeek: Record<string, number>
  revenueByMonth: Record<string, number>
  revenueByYear: Record<string, number>
  revenueByQuarter: Record<string, number>
  bestLocation: string
  worstLocation: string
  bestDay: string
  worstDay: string
  bestChannel: string
  worstChannel: string
  bestItem: string
  anomalies: string[]
  // Profit First Metrics
  realRevenueRM: number
  profitAllocationRM: number
  ownerPayRM: number
  taxAllocationRM: number
  opexRM: number
  profitFirstStatus: "healthy" | "at_risk" | "critical"
}

export interface DecisionCard {
  id: string
  title: string
  priority: "high" | "medium" | "low"
  evidence: string[]
  impactRMMonthly: number
  impactDescription: string
  confidencePct: number
  actionSteps: string[]
  reasoning: string
}

export interface SimulatorParams {
  priceChangePct: number
  cogsChangePct: number
  marketingChangePct: number
}

export interface ScenarioOutcome {
  monthlyRevenueRM: number
  monthlyProfitRM: number
  marginPct: number
  deltaRevenueRM: number
  deltaProfitRM: number
  deltaMarginPct: number
}

export interface MonthProjection {
  month: string
  baseline: number
  pessimistic: number
  likely: number
  optimistic: number
}

export interface SimulationResult {
  baseline: ScenarioOutcome
  pessimistic: ScenarioOutcome
  likely: ScenarioOutcome
  optimistic: ScenarioOutcome
  sixMonthProjection: MonthProjection[]
  params: SimulatorParams
  report: string
  segments: {
    lossMakers: string[]
    cashCows: string[]
    risingStars: string[]
  }
}

export interface SessionData {
  sessionId: string
  uploadedAt: Date
  parsedData: ParsedCSVData
  decisions: DecisionCard[]
  industry: string
}

export interface UploadResponse {
  sessionId: string
  previewKPIs: {
    totalRevenueRM: number
    grossMarginPct: number
    bestLocation: string
    worstLocation: string
    totalTransactions: number
    dateRange: string
    yoyGrowthPct: number
    realRevenueRM: number
    profitFirstStatus: "healthy" | "at_risk" | "critical"
  }
  decisionsCount: number
}

export interface DecisionsResponse {
  decisions: DecisionCard[]
  summary: {
    totalRevenueRM: number
    grossMarginPct: number
    bestLocation: string
    worstLocation: string
    revenueByLocation: Record<string, number>
    revenueByChannel: Record<string, number>
    yoyGrowthPct: number
    anomalies: string[]
  }
}
