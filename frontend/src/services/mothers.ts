import { http } from "./http"

export interface Mother {
  _id: string
  fullName?: string
  phoneNumber?: string
  address?: string
  createdAt?: string
}

export async function listMothers() {
  const { data } = await http.get<Mother[]>("/mothers")
  return data
}

export async function searchMothers(q: string) {
  const { data } = await http.get<Mother[]>("/mothers/search", { params: { q } })
  return data
}

export async function createMother(payload: any) {
  const { data } = await http.post("/mothers", payload)
  return data
}

export async function getMother(id: string) {
  const { data } = await http.get<Mother>(`/mothers/${id}`)
  return data
}

