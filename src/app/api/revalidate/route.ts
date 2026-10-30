import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { API_URL } from "@/lib/api/client";
import { CACHE_RESOURCES, cacheTagFor } from "@/lib/api/cache-tags";

/**
 * POST /api/revalidate { resources: ["blog", "faqs"] } with the panel user's bearer token.
 * The token is checked against the API (/auth/me) — only signed-in team members (any role
 * with at least one permission) can bust the cache; customers and guests get 403.
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return NextResponse.json({ ok: false }, { status: 401 });

  const me = await fetch(`${API_URL}/auth/me`, { headers: { authorization: auth }, cache: "no-store" }).catch(() => null);
  if (!me?.ok) return NextResponse.json({ ok: false }, { status: 401 });
  const user = (await me.json()).data as { permissions?: string[] } | undefined;
  if (!user?.permissions?.length) return NextResponse.json({ ok: false }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as { resources?: unknown };
  const resources = Array.isArray(body.resources) ? body.resources.filter((r): r is string => (CACHE_RESOURCES as readonly string[]).includes(r as string)) : [];
  resources.forEach((r) => revalidateTag(cacheTagFor(`/${r}`)));
  return NextResponse.json({ ok: true, revalidated: resources });
}
