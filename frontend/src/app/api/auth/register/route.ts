import { NextResponse } from "next/server"

const BACKEND_BASE = process.env.BACKEND_BASE_URL ?? "http://localhost:3001/api"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const upstream = await fetch(`${BACKEND_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const text = await upstream.text()
    let data: any = null
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = { message: text }
      }
    }

    if (!upstream.ok) {
      return NextResponse.json(
        { message: data?.message ?? data?.error ?? "Registration failed" },
        { status: upstream.status }
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { message: "Backend registration service is unavailable" },
      { status: 502 }
    )
  }
}

