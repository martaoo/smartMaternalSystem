"use client"

import * as React from "react"
import { toast } from "sonner"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { gateCheckIn } from "@/services/referrals"

export default function GateDashboardPage() {
  const [code, setCode] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return

    setIsSubmitting(true)
    try {
      // Backend expects GateCheckInDto — keep payload generic for now (code field)
      await gateCheckIn({ referralCode: code.trim() })
      toast.success("Checked-in successfully")
      setCode("")
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Check-in failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute requiredRole={["GATEKEEPER", "LIAISON_OFFICER"]}>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-xl p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Gate Check-in</h1>
            <p className="text-sm text-slate-600">Enter referral code to check-in patient.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Referral Code</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-3">
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. SMS-REF-12345" />
                <Button disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Checking in..." : "Check-in"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

