import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { DecisionCard, SimulationResult } from "../types/index"
import { ensureLocalPresetData } from "../lib/localBusinessPreset"

interface PreviewKPIs {
  totalRevenueRM: number
  totalCogsRM: number
  grossMarginPct: number
  bestLocation: string
  worstLocation: string
  totalTransactions: number
  dateRange: string
  yoyGrowthPct: number
  realRevenueRM: number
  avgMonthlyRevenueRM: number
  profitFirstStatus: "healthy" | "at_risk" | "critical"
}

interface SessionContextType {
  sessionId: string | null
  setSessionId: (id: string) => void
  previewKPIs: PreviewKPIs | null
  setPreviewKPIs: (kpis: PreviewKPIs) => void
  decisions: DecisionCard[]
  setDecisions: (d: DecisionCard[]) => void
  simulationResult: SimulationResult | null
  setSimulationResult: (res: SimulationResult | null) => void
  clearSession: () => void
}

const SessionContext = createContext<SessionContextType | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionIdState] = useState<string | null>(() =>
    localStorage.getItem("biziq_session"),
  )
  const [previewKPIs, setPreviewKPIs] = useState<PreviewKPIs | null>(null)
  const [decisions, setDecisions] = useState<DecisionCard[]>([])
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)

  useEffect(() => {
    // Pre-install deterministic dataset into localStorage on app startup.
    ensureLocalPresetData()
  }, [])

  const setSessionId = (id: string) => {
    localStorage.setItem("biziq_session", id)
    setSessionIdState(id)
  }

  const clearSession = () => {
    localStorage.removeItem("biziq_session")
    setSessionIdState(null)
    setPreviewKPIs(null)
    setDecisions([])
    setSimulationResult(null)
  }

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        setSessionId,
        previewKPIs,
        setPreviewKPIs,
        decisions,
        setDecisions,
        simulationResult,
        setSimulationResult,
        clearSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error("useSession must be used inside SessionProvider")
  return ctx
}
