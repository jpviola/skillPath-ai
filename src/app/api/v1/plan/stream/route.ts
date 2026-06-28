// Layer 3 — POST /api/v1/plan/stream : streaming plan generation.
// Emits partial JSON so the client can render weeks as they arrive.
import { NextRequest, NextResponse } from "next/server";
import { profileInputSchema } from "@/lib/schema";
import { streamLearningPlan } from "@/lib/llm";
import { rateLimit } from "@/lib/rateLimit";
import { buildDeviceCookie, getClientFingerprint } from "@/lib/requestIdentity";

export const maxDuration = 120;

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

  const parsed = profileInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "La validación falló", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const result = streamLearningPlan(parsed.data);
    const response = result.toTextStreamResponse();
    if (setCookie) response.cookies.set(buildDeviceCookie(cookieId));
    return response;
  } catch (err) {
    console.error("[plan/stream] generation failed:", err);
    const response = NextResponse.json(
      { error: "La IA está trabajando. Inténtalo de nuevo en un momento." },
      { status: 503 }
    );
    if (setCookie) response.cookies.set(buildDeviceCookie(cookieId));
    return response;
  }
}
