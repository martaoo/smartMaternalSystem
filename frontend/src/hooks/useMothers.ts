import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createMother, listMothers, searchMothers } from "@/services/mothers"

export function useMothers() {
  return useQuery({ queryKey: ["mothers"], queryFn: listMothers })
}

export function useSearchMothers(q: string) {
  return useQuery({
    queryKey: ["mothers", "search", q],
    queryFn: () => searchMothers(q),
    enabled: q.trim().length > 0,
  })
}

export function useCreateMother() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createMother,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mothers"] }),
  })
}

