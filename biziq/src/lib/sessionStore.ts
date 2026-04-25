import { SessionData } from "../types/index"

const store = new Map<string, SessionData>()

export const setSession = (id: string, data: SessionData) => store.set(id, data)
export const getSession = (id: string) => store.get(id)
