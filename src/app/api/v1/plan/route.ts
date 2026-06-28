// Layer 3 — POST /api/v1/plan : generate a new learning plan via the LLM.
import { NextRequest, NextResponse } from "next/server";
import { profileInputSchema } from "@/lib/schema";
import { generateLearningPlan } from "@/lib/llm";
import { rateLimit } from "@/lib/rateLimit";
import { buildDeviceCookie, getClientFingerprint } from "@/lib/requestIdentity";

// Plan generation can take a while (slow models + an occasional retry) — give it
// headroom. Fluid Compute supports long timeouts (default 300s).
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

  const parsed = profileInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "La validación falló", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const requested = (body as { output_language?: string }).output_language;
  const ALLOWED = ["Spanish", "English", "Chinese (Simplified)"];
  const outputLanguage = requested && ALLOWED.includes(requested) ? requested : "Spanish";

  try {
    const plan = await generateLearningPlan(parsed.data, [], outputLanguage);
    const response = NextResponse.json(plan, { status: 201 });
    if (setCookie) response.cookies.set(buildDeviceCookie(cookieId));
    return response;
  } catch (err) {
    console.error("[plan] generation failed:", err);
    const response = NextResponse.json(
      { error: "La IA está trabajando. Inténtalo de nuevo en un momento." },
      { status: 503 }
    );
    if (setCookie) response.cookies.set(buildDeviceCookie(cookieId));
    return response;
  }
}
