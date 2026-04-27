import { http } from "./http"

export type ReferralStatus =
  | "DRAFT"
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "SCHEDULED"
  | "CHECKED_IN"
  | "COMPLETED"
  | "EXPIRED"

export interface Referral {
  _id: string
  status: ReferralStatus
  referralCode?: string
  createdAt?: string
  updatedAt?: string
  targetHospitalId?: string
  attachedFiles?: string[]
}

export async function createReferral(payload: any) {
  const { data } = await http.post("/referrals", payload)
  return data
}

export async function sendReferral(id: string, targetHospitalId: string) {
  const { data } = await http.patch(`/referrals/${id}/send`, { targetHospitalId })
  return data
}

export async function incomingReferrals() {
  const { data } = await http.get<Referral[]>("/referrals/incoming")
  return data
}

export async function outboxReferrals() {
  const { data } = await http.get<Referral[]>("/referrals/liaison/outbox")
  return data
}

export async function specialistQueue() {
  const { data } = await http.get<Referral[]>("/referrals/specialist/queue")
  return data
}

export async function respondReferral(id: string, payload: { response: "ACCEPT" | "REJECT"; note?: string }) {
  const { data } = await http.patch(`/referrals/${id}/respond`, payload)
  return data
}

export async function gateCheckIn(payload: any) {
  const { data } = await http.patch(`/referrals/gate-check-in`, payload)
  return data
}

export async function unlockClinicalData(payload: any) {
  const { data } = await http.post(`/referrals/unlock`, payload)
  return data
}

export async function submitFeedback(id: string, feedbackNote: string) {
  const { data } = await http.patch(`/referrals/${id}/complete`, { feedbackNote })
  return data
}

export async function getReferral(id: string) {
  const { data } = await http.get<Referral>(`/referrals/${id}`)
  return data
}

