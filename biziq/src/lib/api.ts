import axios from "axios"
import { DecisionsResponse, SimulationResult, SimulatorParams, UploadResponse } from "../types/index"

const api = axios.create({ baseURL: "" })

export const uploadFile = async (file: File, industry: string): Promise<UploadResponse> => {
  const form = new FormData()
  form.append("file", file)
  form.append("industry", industry)
  const { data } = await api.post("/api/upload", form)
  return data
}

export const getDecisions = async (sessionId: string): Promise<DecisionsResponse> => {
  const { data } = await api.get(`/api/decisions/${sessionId}`)
  return data
}

export const runSimulation = async (
  sessionId: string,
  params: SimulatorParams,
): Promise<SimulationResult> => {
  const { data } = await api.post(`/api/simulator/${sessionId}`, params)
  return data
}
