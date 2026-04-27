import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  addGrowthRecord,
  createChild,
  getChild,
  getGrowthRecords,
  listChildren,
  listChildrenNeedingFollowUp,
} from "@/services/children"

export function useChildren() {
  return useQuery({ queryKey: ["children"], queryFn: listChildren })
}

export function useChildrenNeedingFollowUp() {
  return useQuery({ queryKey: ["children", "follow-up-needed"], queryFn: listChildrenNeedingFollowUp })
}

export function useChild(id: string) {
  return useQuery({ queryKey: ["children", id], queryFn: () => getChild(id), enabled: !!id })
}

export function useGrowthRecords(childId: string) {
  return useQuery({
    queryKey: ["children", childId, "growth-records"],
    queryFn: () => getGrowthRecords(childId),
    enabled: !!childId,
  })
}

export function useCreateChild() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createChild,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["children"] }),
  })
}

export function useAddGrowthRecord(childId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: any) => addGrowthRecord(childId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["children", childId, "growth-records"] }),
  })
}

