// Layer 3 — POST /api/v1/plan/feedback : adapt the plan based on feedback.
// MVP (no DB): client sends profile + full feedback history + current week.
// Server regenerates with adaptation logic and returns the remaining weeks.
import { NextRequest, NextResponse } from "next/server";
import { feedbackRequestSchema } from "@/lib/schema";
import { adaptRemainingPlan } from "@/lib/llm";
import { rateLimit } from "@/lib/rateLimit";

export const maxDuration = 300;

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

  const parsed = feedbackRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "La validación falló", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { profile, feedback_history, current_week_number, total_weeks, completed_weeks } =
    parsed.data;

  try {
    const result = await adaptRemainingPlan(
      profile,
      feedback_history,
      current_week_number,
      total_weeks,
      completed_weeks
    );
    return NextResponse.json(
      {
        adapted: true,
        updated_weeks: result.weeks,
        adaptation_note: result.adaptation_note,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[feedback] adaptation failed:", err);
    return NextResponse.json(
      { error: "La IA está trabajando. Inténtalo de nuevo en un momento." },
      { status: 503 }
    );
  }
}
