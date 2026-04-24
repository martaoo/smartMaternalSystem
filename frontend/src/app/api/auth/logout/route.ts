import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const COOKIE_NAME = "sms_token"

export async function POST() {
  ;(await cookies()).set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
  return NextResponse.json({ ok: true })
}

