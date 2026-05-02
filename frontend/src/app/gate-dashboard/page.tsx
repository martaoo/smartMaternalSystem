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
  const [isScanning, setIsScanning] = React.useState(false)
  const [scannerSupported, setScannerSupported] = React.useState(false)
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const rafRef = React.useRef<number | null>(null)
  const scanningRef = React.useRef(false)

  React.useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "mediaDevices" in navigator &&
      "getUserMedia" in navigator.mediaDevices &&
      "BarcodeDetector" in window
    setScannerSupported(!!supported)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  async function stopScanner() {
    scanningRef.current = false
    setIsScanning(false)
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
      setIsScanning(true)

      if (!videoRef.current) return
      videoRef.current.srcObject = stream
      await videoRef.current.play()

      const Detector = (window as any).BarcodeDetector
      const detector = new Detector({ formats: ["qr_code"] })

      const scanLoop = async () => {
        if (!videoRef.current || !scanningRef.current) return
        try {
          const barcodes = await detector.detect(videoRef.current)
          if (barcodes?.length > 0) {
            const val = barcodes[0]?.rawValue
            if (val) {
              setCode(val)
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
                <div className="flex gap-2">
                  {scannerSupported && !isScanning && (
                    <Button type="button" variant="secondary" onClick={startScanner} className="flex-1">
                      Scan QR
                    </Button>
                  )}
                  {scannerSupported && isScanning && (
                    <Button type="button" variant="destructive" onClick={stopScanner} className="flex-1">
                      Stop Scanner
                    </Button>
                  )}
                </div>
                {scannerSupported && isScanning && (
                  <video ref={videoRef} className="w-full rounded-md border border-slate-200" autoPlay playsInline muted />
                )}
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

