"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { uploadReferralDoc } from "@/services/files"
import { submitFeedback } from "@/services/referrals"
import { useReferral, useRespondReferral, useSendReferral } from "@/hooks/useReferrals"
import type { User } from "@/types/auth"
import { referralsApi } from "@/lib/healthcare-api"

function statusVariant(status?: string) {
  switch (status) {
    case "ACCEPTED":
      return "success"
    case "REJECTED":
      return "danger"
    case "PENDING":
      return "warning"
    case "COMPLETED":
      return "secondary"
    default:
      return "outline"
  }
}

export default function ReferralDetailsPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const referral = useReferral(id)
  const respond = useRespondReferral()
  const send = useSendReferral()

  const [targetHospitalId, setTargetHospitalId] = React.useState("")
  const [liaisonNote, setLiaisonNote] = React.useState("")
  const [feedbackNote, setFeedbackNote] = React.useState("")
  const [file, setFile] = React.useState<File | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [unlockCode, setUnlockCode] = React.useState("")
  const [isUnlocking, setIsUnlocking] = React.useState(false)

  const user = React.useMemo<User | null>(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }, [])

  async function onUpload() {
    if (!file) return
    setIsUploading(true)
    try {
      await uploadReferralDoc(id, file)
      toast.success("File attached")
      setFile(null)
      referral.refetch()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <ProtectedRoute
      requiredRole={[
        "DOCTOR",
        "NURSE",
        "MIDWIFE",
        "LIAISON_OFFICER",
        "HOSPITAL_ADMIN",
        "HOSPITAL_APPROVER",
        "SPECIALIST",
        "GATEKEEPER",
      ]}
    >
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Referral Details</h1>
              <p className="text-sm text-slate-600">Track and act on referral lifecycle.</p>
            </div>
            <Badge variant={statusVariant(referral.data?.status) as any}>
              {referral.data?.status ?? "—"}
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {referral.isLoading && <p className="text-slate-600">Loading...</p>}
              {referral.isError && <p className="text-red-600">Failed to load referral.</p>}
              {referral.data && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Referral Code</span>
                    <span className="font-medium">{referral.data.referralCode ?? "—"}</span>
                  </div>
                  {"reasonForReferral" in referral.data && (
                    <div className="pt-2">
                      <div className="text-slate-600">Reason</div>
                      <div className="font-medium">{(referral.data as any).reasonForReferral ?? "—"}</div>
                    </div>
                  )}
                  {"liaisonNote" in referral.data && (referral.data as any).liaisonNote && (
                    <div className="pt-2">
                      <div className="text-slate-600">Liaison Note</div>
                      <div className="font-medium">{(referral.data as any).liaisonNote}</div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Referral ID</span>
                    <span className="font-medium">{referral.data._id}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Unlock for receiving hospital staff */}
          {(user?.role === "SPECIALIST" ||
            user?.role === "DOCTOR" ||
            user?.role === "NURSE" ||
            user?.role === "MIDWIFE") &&
            referral.data?.status === "ACCEPTED" &&
            !(referral.data as any)?.isUnlocked && (
              <Card>
                <CardHeader>
                  <CardTitle>Unlock Mother Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    value={unlockCode}
                    onChange={(e) => setUnlockCode(e.target.value)}
                    placeholder="Enter referral code (e.g. REF-...)"
                  />
                  <Button
                    disabled={isUnlocking || !unlockCode.trim()}
                    onClick={async () => {
                      setIsUnlocking(true)
                      try {
                        await referralsApi.unlock({ referralCode: unlockCode.trim() })
                        toast.success("Unlocked")
                        setUnlockCode("")
                        referral.refetch()
                      } catch (err: any) {
                        toast.error(err?.response?.data?.message ?? err?.message ?? "Unlock failed")
                      } finally {
                        setIsUnlocking(false)
                      }
                    }}
                  >
                    {isUnlocking ? "Unlocking..." : "Unlock"}
                  </Button>
                  <p className="text-xs text-slate-600">
                    Until you unlock, you will only see referral highlights.
                  </p>
                </CardContent>
              </Card>
            )}

          {(user?.role === "LIAISON_OFFICER" ||
            user?.role === "DOCTOR" ||
            user?.role === "NURSE" ||
            user?.role === "MIDWIFE") && (
            <Card>
              <CardHeader>
                <CardTitle>Finalize & Send</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={targetHospitalId}
                  onChange={(e) => setTargetHospitalId(e.target.value)}
                  placeholder="Target Hospital ID"
                />
                <Input
                  value={liaisonNote}
                  onChange={(e) => setLiaisonNote(e.target.value)}
                  placeholder="Liaison note to receiving hospital (optional)"
                />
                <Button
                  disabled={send.isPending || !targetHospitalId.trim()}
                  onClick={async () => {
                    try {
                      await send.mutateAsync({
                        id,
                        targetHospitalId: targetHospitalId.trim(),
                        liaisonNote: liaisonNote.trim() || undefined,
                      })
                      toast.success("Referral sent")
                      setTargetHospitalId("")
                      setLiaisonNote("")
                      referral.refetch()
                    } catch (err: any) {
                      toast.error(err?.response?.data?.message ?? err?.message ?? "Send failed")
                    }
                  }}
                >
                  {send.isPending ? "Sending..." : "Send Referral"}
                </Button>
              </CardContent>
            </Card>
          )}

          {(user?.role === "HOSPITAL_APPROVER" || user?.role === "LIAISON_OFFICER") && (
            <Card>
              <CardHeader>
                <CardTitle>Respond (Accept / Reject)</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  disabled={respond.isPending}
                  onClick={async () => {
                    try {
                      await respond.mutateAsync({ id, payload: { status: "ACCEPTED" } })
                      toast.success("Accepted")
                      referral.refetch()
                    } catch (err: any) {
                      toast.error(err?.response?.data?.message ?? err?.message ?? "Action failed")
                    }
                  }}
                >
                  Accept
                </Button>
                <Button
                  variant="destructive"
                  disabled={respond.isPending}
                  onClick={async () => {
                    try {
                      await respond.mutateAsync({
                        id,
                        payload: { status: "REJECTED", justification: "Rejected by receiving hospital" },
                      })
                      toast.success("Rejected")
                      referral.refetch()
                    } catch (err: any) {
                      toast.error(err?.response?.data?.message ?? err?.message ?? "Action failed")
                    }
                  }}
                >
                  Reject
                </Button>
              </CardContent>
            </Card>
          )}

          {(user?.role === "DOCTOR" ||
            user?.role === "NURSE" ||
            user?.role === "MIDWIFE" ||
            user?.role === "LIAISON_OFFICER") && (
            <Card>
              <CardHeader>
                <CardTitle>Attach Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <Button disabled={!file || isUploading} onClick={onUpload}>
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>
              </CardContent>
            </Card>
          )}

          {(user?.role === "DOCTOR" ||
            user?.role === "NURSE" ||
            user?.role === "MIDWIFE" ||
            user?.role === "LIAISON_OFFICER") && (
            <Card>
              <CardHeader>
                <CardTitle>Submit Feedback (Complete)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder="Feedback note"
                />
                <Button
                  variant="secondary"
                  disabled={!feedbackNote.trim()}
                  onClick={async () => {
                    try {
                      await submitFeedback(id, feedbackNote.trim())
                      toast.success("Feedback submitted")
                      setFeedbackNote("")
                      referral.refetch()
                    } catch (err: any) {
                      toast.error(err?.response?.data?.message ?? err?.message ?? "Submit failed")
                    }
                  }}
                >
                  Submit
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

