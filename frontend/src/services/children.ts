import { http } from "./http"

export interface Child {
  _id: string
  name?: string
  sex?: string
  dateOfBirth?: string
  motherId?: string
  createdAt?: string
}

export interface GrowthRecord {
  _id: string
  childId: string
  weightKg?: number
  heightCm?: number
  muacCm?: number
  recordedAt?: string
  createdAt?: string
}

export async function listChildren() {
  const { data } = await http.get<Child[]>("/children")
  return data
}

export async function searchChildren(q: string) {
  const { data } = await http.get<Child[]>("/children/search", { params: { q } })
  return data
}

export async function listChildrenNeedingFollowUp() {
  const { data } = await http.get<Child[]>("/children/follow-up-needed")
  return data
}

export async function createChild(payload: any) {
  const { data } = await http.post("/children", payload)
  return data
}

export async function getChild(id: string) {
  const { data } = await http.get<Child>(`/children/${id}`)
  return data
}

export async function addGrowthRecord(childId: string, payload: any) {
  const { data } = await http.post(`/children/${childId}/growth-records`, payload)
  return data
}

export async function getGrowthRecords(childId: string) {
  const { data } = await http.get<GrowthRecord[]>(`/children/${childId}/growth-records`)
  return data
}

