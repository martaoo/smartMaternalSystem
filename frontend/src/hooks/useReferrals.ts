import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createReferral,
  getReferral,
  incomingReferrals,
  outboxReferrals,
  respondReferral,
  sendReferral,
  specialistQueue,
} from "@/services/referrals"

export function useIncomingReferrals() {
  return useQuery({
    queryKey: ["referrals", "incoming"],
    queryFn: incomingReferrals,
    refetchInterval: 15_000,
  })
}

export function useOutboxReferrals() {
  return useQuery({
    queryKey: ["referrals", "outbox"],
    queryFn: outboxReferrals,
    refetchInterval: 15_000,
  })
}

export function useSpecialistQueue() {
  return useQuery({
    queryKey: ["referrals", "specialist-queue"],
    queryFn: specialistQueue,
    refetchInterval: 15_000,
  })
}

export function useReferral(id: string) {
  return useQuery({
    queryKey: ["referrals", id],
    queryFn: () => getReferral(id),
    enabled: !!id,
  })
}

export function useCreateReferral() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createReferral,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referrals"] }),
  })
}

export function useSendReferral() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, targetHospitalId }: { id: string; targetHospitalId: string }) =>
      sendReferral(id, targetHospitalId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referrals", "incoming"] })
      qc.invalidateQueries({ queryKey: ["referrals", "outbox"] })
    },
  })
}

export function useRespondReferral() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: { status: "ACCEPTED" | "REJECTED"; justification?: string; appointmentDate?: string }
    }) =>
      respondReferral(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referrals"] }),
  })
}

