"use client"

import Link from "next/link"
import { toast } from "sonner"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useIncomingReferrals, useOutboxReferrals } from "@/hooks/useReferrals"

export default function LiaisonDashboardPage() {
  const incoming = useIncomingReferrals()
  const outbox = useOutboxReferrals()

  return (
    <ProtectedRoute requiredRole={["LIAISON_OFFICER", "DOCTOR", "HOSPITAL_ADMIN"]}>
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
                  <div key={r._id} className="flex items-center justify-between rounded-md border bg-white p-3">
                    <div className="space-y-1">
                      <div className="font-medium">Referral #{r.referralCode ?? r._id.slice(-6)}</div>
                      <div className="text-xs text-slate-600">Status: {r.status}</div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/referrals/${r._id}`}>Open</Link>
                    </Button>
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
                  <div key={r._id} className="flex items-center justify-between rounded-md border bg-white p-3">
                    <div className="space-y-1">
                      <div className="font-medium">Referral #{r.referralCode ?? r._id.slice(-6)}</div>
                      <div className="text-xs text-slate-600">Status: {r.status}</div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/referrals/${r._id}`}>View</Link>
                    </Button>
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

