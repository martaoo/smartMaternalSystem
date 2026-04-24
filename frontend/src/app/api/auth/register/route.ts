import { NextResponse } from "next/server"

const BACKEND_BASE = process.env.BACKEND_BASE_URL ?? "http://localhost:3001/api"

export async function POST(req: Request) {
  const body = await req.json()

  const upstream = await fetch(`${BACKEND_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const text = await upstream.text()
  const data = text ? JSON.parse(text) : null

  if (!upstream.ok) {
    return NextResponse.json(
      { message: data?.message ?? data?.error ?? "Registration failed" },
      { status: upstream.status }
    )
  }

  return NextResponse.json(data)
}

