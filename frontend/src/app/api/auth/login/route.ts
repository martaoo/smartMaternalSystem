import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const BACKEND_BASE = process.env.BACKEND_BASE_URL ?? "http://localhost:3001/api"
const COOKIE_NAME = "sms_token"

export async function POST(req: Request) {
  const body = await req.json()

  const upstream = await fetch(`${BACKEND_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const text = await upstream.text()
  const data = text ? JSON.parse(text) : null

  if (!upstream.ok) {
    return NextResponse.json(
      { message: data?.message ?? data?.error ?? "Login failed" },
      { status: upstream.status }
    )
  }

  const token = data?.access_token as string | undefined
  if (!token) {
    return NextResponse.json({ message: "Missing access token" }, { status: 502 })
  }

  const isProd = process.env.NODE_ENV === "production"
  ;(await cookies()).set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  return NextResponse.json({ user: data.user })
}

