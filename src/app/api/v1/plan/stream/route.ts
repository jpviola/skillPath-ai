// Layer 3 — POST /api/v1/plan/stream : streaming plan generation.
// Emits partial JSON so the client can render weeks as they arrive.
import { NextRequest, NextResponse } from "next/server";
import { profileInputSchema } from "@/lib/schema";
import { streamLearningPlan } from "@/lib/llm";
import { rateLimit } from "@/lib/rateLimit";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const deviceId = req.headers.get("x-device-id") || "anonymous";

  const limited = rateLimit(deviceId);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Ve un poco más despacio." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
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
    return result.toTextStreamResponse();
  } catch (err) {
    console.error("[plan/stream] generation failed:", err);
    return NextResponse.json(
      { error: "La IA está trabajando. Inténtalo de nuevo en un momento." },
      { status: 503 }
    );
  }
}
