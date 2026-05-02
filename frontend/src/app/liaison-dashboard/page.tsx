"use client"

import Link from "next/link"
import { toast } from "sonner"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useIncomingReferrals, useOutboxReferrals } from "@/hooks/useReferrals"

function pickName(obj: any) {
  return obj?.fullName ?? obj?.name ?? "—"
}

export default function LiaisonDashboardPage() {
  const incoming = useIncomingReferrals()
  const outbox = useOutboxReferrals()

  return (
    <ProtectedRoute requiredRole={["LIAISON_OFFICER", "DOCTOR", "NURSE", "MIDWIFE", "HOSPITAL_ADMIN"]}>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Liaison Dashboard</h1>
              <p className="text-sm text-slate-600">Finalize, send, and track referrals.</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                incoming.refetch()
                outbox.refetch()
                toast.success("Refreshed")
              }}
            >
              Refresh
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Incoming (Draft / Pending)</CardTitle>
                <Badge variant="secondary">{incoming.data?.length ?? 0}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {incoming.isLoading && <p className="text-sm text-slate-600">Loading...</p>}
                {incoming.isError && (
                  <p className="text-sm text-red-600">Failed to load incoming referrals.</p>
                )}
                {(incoming.data ?? []).slice(0, 8).map((r) => (
                  <div key={r._id} className="rounded-md border bg-white p-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="font-medium">Referral #{r.referralCode ?? r._id.slice(-6)}</div>
                        <div className="text-xs text-slate-600">Status: {r.status}</div>
                        <div className="text-xs text-slate-600">
                          Mother: {typeof r.motherId === "object" ? pickName(r.motherId) : "—"}{" "}
                          {typeof r.motherId === "object" && r.motherId?.age ? `(${r.motherId.age}y)` : ""}
                        </div>
                        {r.reasonForReferral && (
                          <div className="text-xs text-slate-600">Reason: {r.reasonForReferral}</div>
                        )}
                        <div className="text-xs text-slate-600">
                          From: {typeof r.fromHospital === "object" ? pickName(r.fromHospital) : "—"}
                        </div>
                        <div className="text-xs text-slate-600">
                          By: {typeof r.createdBy === "object" ? pickName(r.createdBy) : "—"}
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/referrals/${r._id}`}>Open</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Outbox (Sent)</CardTitle>
                <Badge variant="secondary">{outbox.data?.length ?? 0}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {outbox.isLoading && <p className="text-sm text-slate-600">Loading...</p>}
                {outbox.isError && <p className="text-sm text-red-600">Failed to load outbox.</p>}
                {(outbox.data ?? []).slice(0, 8).map((r) => (
                  <div key={r._id} className="rounded-md border bg-white p-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="font-medium">Referral #{r.referralCode ?? r._id.slice(-6)}</div>
                        <div className="text-xs text-slate-600">Status: {r.status}</div>
                        <div className="text-xs text-slate-600">
                          To: {typeof r.toHospital === "object" ? pickName(r.toHospital) : "—"}
                        </div>
                        <div className="text-xs text-slate-600">
                          Mother: {typeof r.motherId === "object" ? pickName(r.motherId) : "—"}
                        </div>
                        {r.liaisonNote && (
                          <div className="text-xs text-slate-600">Liaison note: {r.liaisonNote}</div>
                        )}
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/referrals/${r._id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

