import { NextResponse } from "next/server"

const BACKEND_BASE = process.env.BACKEND_BASE_URL ?? "http://localhost:3001/api"
const COOKIE_NAME = "sms_token"

/** Route handlers must stay dynamic; avoids broken dev bundles trying to “staticize” this catch‑all. */
export const dynamic = "force-dynamic"

function getBearerFromCookies(req: Request): string | undefined {
  const raw = req.headers.get("cookie")
  if (!raw) return undefined
  const prefix = `${COOKIE_NAME}=`
  const parts = raw.split(";").map((s) => s.trim())
  for (const p of parts) {
    if (p.startsWith(prefix)) {
      try {
        return decodeURIComponent(p.slice(prefix.length))
      } catch {
        return p.slice(prefix.length)
      }
    }
  }
  return undefined
}

async function handler(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await ctx.params
  const url = new URL(req.url)
  const targetUrl = `${BACKEND_BASE}/${path.join("/")}${url.search}`

  const token = getBearerFromCookies(req)
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const headers = new Headers(req.headers)
  headers.set("Authorization", `Bearer ${token}`)
  headers.delete("host")

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
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
