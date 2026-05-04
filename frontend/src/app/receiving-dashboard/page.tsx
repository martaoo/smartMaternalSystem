"use client"

import Link from "next/link"
import { toast } from "sonner"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useIncomingReferrals, useRespondReferral, useSpecialistQueue } from "@/hooks/useReferrals"

function pickName(obj: any) {
  return obj?.fullName ?? obj?.name ?? "—"
}

export default function ReceivingDashboardPage() {
  const incoming = useIncomingReferrals()
  const queue = useSpecialistQueue()
  const respond = useRespondReferral()

  return (
    <ProtectedRoute requiredRole={["SPECIALIST", "HOSPITAL_APPROVER", "HOSPITAL_ADMIN"]}>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Receiving Hospital</h1>
              <p className="text-sm text-slate-600">Incoming referrals, approvals, and specialist queue.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/receiving-dashboard/profile" className="text-sm text-blue-600 hover:underline">
                My Profile
              </Link>
              <Button
                variant="secondary"
                onClick={() => {
                  incoming.refetch()
                  queue.refetch()
                  toast.success("Refreshed")
                }}
              >
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Incoming Referrals</CardTitle>
                <Badge variant="secondary">{incoming.data?.length ?? 0}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {incoming.isLoading && <p className="text-sm text-slate-600">Loading...</p>}
                {incoming.isError && <p className="text-sm text-red-600">Failed to load incoming referrals.</p>}
                {(incoming.data ?? []).slice(0, 8).map((r) => (
                  <div key={r._id} className="rounded-md border bg-white p-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="font-medium">Referral #{r.referralCode ?? r._id.slice(-6)}</div>
                        <div className="text-xs text-slate-600">Status: {r.status}</div>
                        <div className="text-xs text-slate-600">
                          From: {typeof r.fromHospital === "object" ? pickName(r.fromHospital) : "—"}
                        </div>
                        <div className="text-xs text-slate-600">
                          By: {typeof r.createdBy === "object" ? pickName(r.createdBy) : "—"}
                        </div>
                        <div className="text-xs text-slate-600">
                          Mother: {typeof r.motherId === "object" ? pickName(r.motherId) : "—"}{" "}
                          {typeof r.motherId === "object" && r.motherId?.age ? `(${r.motherId.age}y)` : ""}
                        </div>
                        {r.reasonForReferral && (
                          <div className="text-xs text-slate-600">Reason: {r.reasonForReferral}</div>
                        )}
                        {r.liaisonNote && (
                          <div className="text-xs text-slate-600">Liaison note: {r.liaisonNote}</div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/referrals/${r._id}`}>Review</Link>
                        </Button>
                        {r.status === "CHECKED_IN" && (
                          <>
                            <Button
                              size="sm"
                              disabled={respond.isPending}
                              onClick={async () => {
                                try {
                                  await respond.mutateAsync({ id: r._id, payload: { status: "ACCEPTED" } })
                                  toast.success("Accepted")
                                  incoming.refetch()
                                  queue.refetch()
                                } catch (err: any) {
                                  toast.error(err?.response?.data?.message ?? err?.message ?? "Accept failed")
                                }
                              }}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={respond.isPending}
                              onClick={async () => {
                                const justification = window.prompt("Rejection justification:")
                                if (!justification?.trim()) {
                                  toast.error("Justification is required to reject.")
                                  return
                                }
                                try {
                                  await respond.mutateAsync({
                                    id: r._id,
                                    payload: { status: "REJECTED", justification: justification.trim() },
                                  })
                                  toast.success("Rejected")
                                  incoming.refetch()
                                } catch (err: any) {
                                  toast.error(err?.response?.data?.message ?? err?.message ?? "Reject failed")
                                }
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {r.status === "PENDING" && (
                          <p className="text-[11px] text-slate-600 max-w-[130px]">
                            Waiting for gate check-in before decision.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Specialist Queue</CardTitle>
                <Badge variant="secondary">{queue.data?.length ?? 0}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {queue.isLoading && <p className="text-sm text-slate-600">Loading...</p>}
                {queue.isError && <p className="text-sm text-red-600">Failed to load queue.</p>}
                {(queue.data ?? []).slice(0, 8).map((r) => (
                  <div key={r._id} className="rounded-md border bg-white p-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="font-medium">Referral #{r.referralCode ?? r._id.slice(-6)}</div>
                        <div className="text-xs text-slate-600">Status: {r.status}</div>
                        <div className="text-xs text-slate-600">
                          Mother: {typeof r.motherId === "object" ? pickName(r.motherId) : "—"}
                        </div>
                        <div className="text-xs text-slate-600">
                          From: {typeof r.fromHospital === "object" ? pickName(r.fromHospital) : "—"}
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
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

