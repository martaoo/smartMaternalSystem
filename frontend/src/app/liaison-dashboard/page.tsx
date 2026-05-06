"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useCheckedInReferrals, useIncomingReferrals, useOutboxReferrals, useRespondReferral } from "@/hooks/useReferrals"
import { gateCheckIn } from "@/services/referrals"
import type { User } from "@/types/auth"

function pickName(obj: any) {
  return obj?.fullName ?? obj?.name ?? "—"
}

export default function LiaisonDashboardPage() {
  const incoming = useIncomingReferrals()
  const outbox = useOutboxReferrals()
  const checkedIn = useCheckedInReferrals()
  const respond = useRespondReferral()

  const [checkinCode, setCheckinCode] = React.useState("")
  const [isSubmittingCheckin, setIsSubmittingCheckin] = React.useState(false)
  const [isScanningCheckin, setIsScanningCheckin] = React.useState(false)
  const [cameraSupported, setCameraSupported] = React.useState(false)
  const [barcodeSupported, setBarcodeSupported] = React.useState(false)
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const rafRef = React.useRef<number | null>(null)
  const scanningRef = React.useRef(false)
  const jsQRRef = React.useRef<any>(null)

  const user = React.useMemo<User | null>(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }, [])

  const canCheckIn = user?.role === "LIAISON_OFFICER"

  React.useEffect(() => {
    const cameraAvailable =
      typeof window !== "undefined" &&
      "mediaDevices" in navigator &&
      "getUserMedia" in navigator.mediaDevices
    setCameraSupported(!!cameraAvailable)
    setBarcodeSupported(!!cameraAvailable && "BarcodeDetector" in window)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  async function stopScanner() {
    scanningRef.current = false
    setIsScanningCheckin(false)
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  async function startScanner() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      })
      streamRef.current = stream
      scanningRef.current = true
      setIsScanningCheckin(true)

      const waitForVideo = async () => {
        let attempts = 0
        while (!videoRef.current && attempts < 10) {
          await new Promise((resolve) => requestAnimationFrame(resolve))
          attempts += 1
        }
      }
      await waitForVideo()

      if (!videoRef.current) {
        toast.error("Unable to attach camera preview. Refresh and try again.")
        await stopScanner()
        return
      }

      videoRef.current.srcObject = stream
      await videoRef.current.play()

      const hasNativeDetector = "BarcodeDetector" in window
      let detector: any = null
      let ctx: CanvasRenderingContext2D | null = null

      if (hasNativeDetector) {
        const Detector = (window as any).BarcodeDetector
        detector = new Detector({ formats: ["qr_code"] })
      } else {
        const jsqrModule = await import("jsqr")
        jsQRRef.current = jsqrModule.default ?? jsqrModule
        const canvas = document.createElement("canvas")
        canvasRef.current = canvas
        ctx = canvas.getContext("2d")
      }

      const scanLoop = async () => {
        if (!videoRef.current || !scanningRef.current) return
        try {
          if (hasNativeDetector) {
            const barcodes = await detector.detect(videoRef.current)
            if (barcodes?.length > 0) {
              const val = barcodes[0]?.rawValue
              if (val) {
                setCheckinCode(val)
                toast.success("QR scanned")
                await stopScanner()
                return
              }
            }
          } else if (ctx && canvasRef.current) {
            const canvas = canvasRef.current
            canvas.width = videoRef.current.videoWidth
            canvas.height = videoRef.current.videoHeight
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const result = jsQRRef.current(imageData.data, canvas.width, canvas.height)
            if (result?.data) {
              setCheckinCode(result.data)
              toast.success("QR scanned")
              await stopScanner()
              return
            }
          }
        } catch {
          // Ignore per-frame detection errors and continue scanning.
        }
        rafRef.current = requestAnimationFrame(scanLoop)
      }

      rafRef.current = requestAnimationFrame(scanLoop)
    } catch (err: any) {
      toast.error(err?.message ?? "Could not start camera scanner")
      await stopScanner()
    }
  }

  async function onSubmitCheckIn(e: React.FormEvent) {
    e.preventDefault()
    if (!checkinCode.trim()) {
      toast.error("Please enter or scan a referral code before checking in")
      return
    }

    setIsSubmittingCheckin(true)
    try {
      await gateCheckIn({ referralCode: checkinCode.trim() })
      toast.success("Mother checked in")
      setCheckinCode("")
      incoming.refetch()
      outbox.refetch()
      checkedIn.refetch()
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Check-in failed")
    } finally {
      setIsSubmittingCheckin(false)
    }
  }

  return (
    <ProtectedRoute requiredRole={["LIAISON_OFFICER", "DOCTOR", "NURSE", "MIDWIFE", "HOSPITAL_ADMIN"]}>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Liaison Dashboard</h1>
              <p className="text-sm text-slate-600">Finalize, send, and track referrals.</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                incoming.refetch()
                outbox.refetch()
                checkedIn.refetch()
                toast.success("Refreshed")
              }}
            >
              Refresh
            </Button>
          </div>

          {canCheckIn && (
            <Card>
              <CardHeader>
                <CardTitle>Gate Check-in</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600">
                  Scan the referral QR code or enter the referral code to check in the mother.
                </p>
                <form onSubmit={onSubmitCheckIn} className="space-y-3">
                  <Input
                    value={checkinCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCheckinCode(e.target.value)}
                    placeholder="Referral code or scanned QR value"
                  />
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      {cameraSupported && !isScanningCheckin && (
                        <Button type="button" variant="secondary" onClick={startScanner} className="flex-1">
                          Scan QR
                        </Button>
                      )}
                      {cameraSupported && isScanningCheckin && (
                        <Button type="button" variant="destructive" onClick={stopScanner} className="flex-1">
                          Stop Scanner
                        </Button>
                      )}
                    </div>
                    {!cameraSupported && (
                      <p className="text-xs text-slate-500">
                        Camera scanning is unavailable in this browser. Use the referral code field instead.
                      </p>
                    )}
                    {cameraSupported && !barcodeSupported && (
                      <p className="text-xs text-slate-500">
                        Camera access is available. A fallback QR decoder will be used when native BarcodeDetector is not supported.
                      </p>
                    )}
                  </div>
                  {isScanningCheckin && (
                    <video
                      ref={videoRef}
                      className="w-full h-72 rounded-md border border-slate-200 bg-black"
                      autoPlay
                      playsInline
                      muted
                    />
                  )}
                  <Button type="submit" disabled={!checkinCode.trim() || isSubmittingCheckin} className="w-full">
                    {isSubmittingCheckin ? "Checking in..." : "Check-in mother"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-3">
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
                      <div className="flex flex-col gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/referrals/${r._id}`}>Open</Link>
                        </Button>
                        {r.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              onClick={async () => {
                                try {
                                  await respond.mutateAsync({ id: r._id, payload: { status: "ACCEPTED" } })
                                  toast.success("Accepted")
                                  incoming.refetch()
                                  outbox.refetch()
                                  checkedIn.refetch()
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
                              onClick={async () => {
                                const justification = window.prompt("Rejection reason:")
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
                                  outbox.refetch()
                                } catch (err: any) {
                                  toast.error(err?.response?.data?.message ?? err?.message ?? "Reject failed")
                                }
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
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

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Checked-in Mothers</CardTitle>
                <Badge variant="secondary">{checkedIn.data?.length ?? 0}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {checkedIn.isLoading && <p className="text-sm text-slate-600">Loading...</p>}
                {checkedIn.isError && <p className="text-sm text-red-600">Failed to load checked-in list.</p>}
                {(checkedIn.data ?? []).slice(0, 8).map((r) => (
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
                        <Link href={`/referrals/${r._id}`}>Review</Link>
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

