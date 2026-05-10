import { NextRequest, NextResponse } from "next/server"

const BACKEND_BASE = process.env.BACKEND_BASE_URL ?? "http://localhost:3001/api"
const COOKIE_NAME = "sms_token"

export const dynamic = "force-dynamic"

/** Extract the JWT from the Authorization header or the sms_token cookie. */
function resolveToken(req: NextRequest): string | undefined {
  // 1. Prefer explicit Authorization header (set by client-side fetch / axios)
  const authHeader = req.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7)
  }

  // 2. Fall back to the cookie set by the login route (covers SSR / page-reload)
  const cookie = req.cookies.get(COOKIE_NAME)
  if (cookie?.value) return cookie.value

  // 3. Also check raw cookie header for environments where cookies.get() may miss it
  const rawCookie = req.headers.get("cookie")
  if (rawCookie) {
    const prefix = `${COOKIE_NAME}=`
    for (const part of rawCookie.split(";").map(s => s.trim())) {
      if (part.startsWith(prefix)) {
        try { return decodeURIComponent(part.slice(prefix.length)) }
        catch { return part.slice(prefix.length) }
      }
    }
  }

  return undefined
}

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await params
  const joinedPath = path.join("/")
  const targetUrl = `${BACKEND_BASE}/${joinedPath}${req.nextUrl.search}`

  const isPublic = joinedPath === "auth/login" || joinedPath === "auth/register"

  const token = resolveToken(req)

  if (!token && !isPublic) {
    console.warn(`[PROXY] ❌ No token for: ${joinedPath}`)
    return NextResponse.json({ message: "Unauthorized - missing token" }, { status: 401 })
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[PROXY] ${req.method} ${joinedPath} — token: ${token ? "✓" : "✗"}`)
  }

  const headers = new Headers()
  headers.set("Content-Type", "application/json")
  if (token) headers.set("Authorization", `Bearer ${token}`)

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer(),
      redirect: "manual",
    })

    const resHeaders = new Headers(upstream.headers)
    resHeaders.delete("set-cookie")
    resHeaders.delete("content-encoding")

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: resHeaders,
    })
  } catch (error: any) {
    const code = error?.cause?.code ?? error?.code
    const message =
      code === "ECONNREFUSED" || code === "ETIMEDOUT"
        ? "Backend service is unavailable"
        : "Failed to reach backend service"
    return NextResponse.json({ message, code }, { status: 502 })
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
