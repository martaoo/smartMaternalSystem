import { NextResponse } from "next/server"

const BACKEND_BASE = process.env.BACKEND_BASE_URL ?? "http://localhost:3001/api"
const COOKIE_NAME = "sms_token"
const COOKIE_MAX_AGE = 60 * 60 * 24 // 24 hours

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const upstream = await fetch(`${BACKEND_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const text = await upstream.text()
    let data: any = null
    if (text) {
      try { data = JSON.parse(text) } catch { data = { message: text } }
    }

    if (!upstream.ok) {
      return NextResponse.json(
        { message: data?.message ?? data?.error ?? "Login failed" },
        { status: upstream.status },
      )
    }

    const token = data?.access_token as string | undefined
    if (!token) {
      return NextResponse.json({ message: "Missing access token" }, { status: 502 })
    }

    // Return token in both the JSON body (for localStorage) AND as an HTTP cookie
    // so the proxy can forward it on SSR requests where localStorage is unavailable.
    const response = NextResponse.json({
      user: data.user,
      access_token: token,
      message: "Login successful",
    })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: false,   // must be readable by JS so the proxy can forward it
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[LOGIN] Error:", error)
    return NextResponse.json(
      { message: "Backend login service is unavailable" },
      { status: 502 },
    )
  }
}
