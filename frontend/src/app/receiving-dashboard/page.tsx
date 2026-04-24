"use client"

import Link from "next/link"
import { toast } from "sonner"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useIncomingReferrals, useSpecialistQueue } from "@/hooks/useReferrals"

export default function ReceivingDashboardPage() {
  const incoming = useIncomingReferrals()
  const queue = useSpecialistQueue()

  return (
    <ProtectedRoute requiredRole={["SPECIALIST", "HOSPITAL_APPROVER", "HOSPITAL_ADMIN"]}>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Receiving Hospital</h1>
              <p className="text-sm text-slate-600">Incoming referrals, approvals, and specialist queue.</p>
            </div>
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
                  <div key={r._id} className="flex items-center justify-between rounded-md border bg-white p-3">
                    <div className="space-y-1">
                      <div className="font-medium">Referral #{r.referralCode ?? r._id.slice(-6)}</div>
                      <div className="text-xs text-slate-600">Status: {r.status}</div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/referrals/${r._id}`}>Review</Link>
                    </Button>
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
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

