// Layer 3 — POST /api/v1/placement : generate a CEFR placement test for a language.
import { NextRequest, NextResponse } from "next/server";
import { placementRequestSchema } from "@/lib/schema";
import { generatePlacementTest } from "@/lib/llm";
import { rateLimit } from "@/lib/rateLimit";
import { buildDeviceCookie, getClientFingerprint } from "@/lib/requestIdentity";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { cookieId, fingerprint, setCookie } = getClientFingerprint(req);

  const limited = await rateLimit(fingerprint);
  if (!limited.ok) {
    const response = NextResponse.json(
      { error: "Demasiadas solicitudes. Ve un poco más despacio." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
    if (setCookie) response.cookies.set(buildDeviceCookie(cookieId));
    return response;
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido." }, { status: 400 });
  }

  const parsed = placementRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "La validación falló", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const test = await generatePlacementTest(parsed.data.language);
    const response = NextResponse.json(test, { status: 200 });
    if (setCookie) response.cookies.set(buildDeviceCookie(cookieId));
    return response;
  } catch (err) {
    console.error("[placement] generation failed:", err);
    const response = NextResponse.json(
      { error: "La IA está trabajando. Inténtalo de nuevo en un momento." },
      { status: 503 }
    );
    if (setCookie) response.cookies.set(buildDeviceCookie(cookieId));
    return response;
  }
}
