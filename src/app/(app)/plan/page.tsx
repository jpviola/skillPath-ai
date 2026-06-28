"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Target, Clock, Coins, Languages, Sparkles, Laptop, ArrowRight, Play, CheckCircle2 } from "lucide-react";
import {
  usePlan,
  computeOverallPercent,
  countByStatus,
  weekStatus,
  weekDoneCount,
  nextTopicIndex,
  computeStreak,
  getTodayLog,
} from "@/context/PlanContext";
import ProgressRing from "@/components/ProgressRing";
import WeekCard from "@/components/WeekCard";
import FeedbackCard from "@/components/FeedbackCard";
import { useI18n } from "@/lib/i18n";

export default function DashboardPage() {
  const { state, dispatch } = usePlan();
  const { t, L, locale } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (state.hydrated && !state.plan) router.replace("/onboard");
  }, [state.hydrated, state.plan, router]);

  if (!state.hydrated) {
    return <div className="p-8 text-sm text-ink-soft">{t("dash.loading")}</div>;
  }
  if (!state.plan || !state.userProfile) {
    return <div className="p-8 text-sm text-ink-soft">{t("dash.noPlan")}</div>;
  }

  const { plan, weeks, topicProgress, userProfile } = state;
  const overall = computeOverallPercent(weeks, topicProgress);
  const counts = countByStatus(weeks, topicProgress);
  const streak = computeStreak(state.dailyLogs);
  const todayLog = getTodayLog(state.dailyLogs);

  // current week = lowest week not fully completed
  const currentWeek =
    weeks.find((w) => weekStatus(w, topicProgress) !== "completed") || weeks[weeks.length - 1];
  const nextWeek = weeks.find((w) => w.week_number === currentWeek.week_number + 1);

  // "Focus now" — the next concrete action
  const focusTopicIdx = nextTopicIndex(currentWeek, topicProgress);
  const focusTopic = focusTopicIdx !== null ? currentWeek.topics[focusTopicIdx] : null;
  const curDone = weekDoneCount(currentWeek, topicProgress);

  // Estimated finish: one calendar week per remaining (not fully completed) week.
  const weeksRemaining = weeks.filter((w) => weekStatus(w, topicProgress) !== "completed").length;
  const now = new Date();
  const estFinish =
    weeksRemaining > 0
      ? new Date(now.getTime() + weeksRemaining * 7 * 86_400_000).toLocaleDateString(
          locale === "es" ? "es-ES" : locale === "zh" ? "zh-CN" : "en-US",
          {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">{t("dash.journey", { skill: plan.skill })}</h1>
        <p className="text-sm text-ink-soft">
          {t("dash.meta", {
            total: plan.total_weeks,
            hrs: plan.weekly_time_hours,
            cost: plan.estimated_total_cost,
          })}
          {estFinish && (
            <>
              {" · "}
              <span className="font-medium text-ink">{t("dash.estFinish", { date: estFinish })}</span>
            </>
          )}
        </p>
        {streak.current > 0 && todayLog && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-md border-[2px] border-ink bg-pop-yellow px-3 py-1 text-xs font-black uppercase tracking-wide text-ink shadow-[2px_2px_0_0_#1a1a1a]">
            🔥 {t("game.streakAlive", { n: streak.current })}
          </p>
        )}
        {streak.current === 0 && streak.longest > 0 && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-md border-[2px] border-ink bg-pop-coral px-3 py-1 text-xs font-bold text-ink">
            😔 {t("game.streakLost")}
          </p>
        )}
      </div>

      {/* Focus now — the single clearest next action */}
      <section className="memphis-banner mb-6 overflow-hidden rounded-card bg-linear-to-r from-primary to-primary-dark p-5 text-white shadow-elevated">
        {focusTopic ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-white/70">
                {t("dash.focus", {
                  week: currentWeek.week_number,
                  done: curDone,
                  total: currentWeek.topics.length,
                })}
              </p>
              <p className="mt-1 truncate text-lg font-bold">{focusTopic.name}</p>
              <p className="text-sm text-white/85">
                {L.topicType[focusTopic.type]} · {focusTopic.estimated_minutes} min — {currentWeek.title}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() =>
                  dispatch({
                    type: "TOGGLE_TOPIC",
                    payload: { weekNumber: currentWeek.week_number, topicIndex: focusTopicIdx! },
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-4 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-white/25"
              >
                <CheckCircle2 size={16} /> {t("dash.markDone")}
              </button>
              <Link
                href={`/plan/${currentWeek.week_number}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary-light"
              >
                <Play size={16} /> {t("dash.openWeek")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <CheckCircle2 size={28} />
            <div>
              <p className="text-lg font-bold">{t("dash.allDone")}</p>
              <p className="text-sm text-white/85">{t("dash.allDoneSub")}</p>
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile — row 1, left (mobile: 1st) */}
        <section className="card order-1 p-5 lg:col-span-2 lg:col-start-1 lg:row-start-1">
          <h2 className="mb-3 text-sm font-semibold text-ink">{t("dash.aboutYou")}</h2>
          <div className="flex flex-wrap gap-2">
            <Badge icon={<Languages size={13} />} label={userProfile.skill} tone="primary" />
            {userProfile.track === "native_mastery" && userProfile.focus_areas?.length ? (
              userProfile.focus_areas.map((f) => <Badge key={f} label={L.focus[f]} />)
            ) : (
              <Badge label={L.level[userProfile.current_level]} />
            )}
            <Badge icon={<Clock size={13} />} label={userProfile.time_available} />
            <Badge
              icon={<Sparkles size={13} />}
              label={userProfile.learning_style.map((s) => L.style[s]).join(" + ")}
            />
            <Badge icon={<Coins size={13} />} label={L.pref[userProfile.resource_preference]} />
          </div>
          <p className="mt-3 flex items-start gap-1.5 text-sm text-ink-soft">
            <Target size={15} className="mt-0.5 shrink-0 text-primary" />
            {userProfile.goal}
          </p>
        </section>

        {/* Timeline — row 2, left (mobile: 3rd, after the right rail) */}
        <section className="order-3 lg:col-span-2 lg:col-start-1 lg:row-start-2">
          <h2 className="mb-3 text-lg font-bold text-ink">{t("dash.timeline")}</h2>
          <div className="space-y-3">
            {weeks.map((w) => (
              <WeekCard key={w.week_number} week={w} />
            ))}
          </div>
        </section>

        {/* Right rail: progress + feedback + next up + tip (mobile: 2nd) */}
        <div className="order-2 space-y-6 lg:col-start-3 lg:row-span-2 lg:row-start-1">
          {/* Progress panel */}
          <section className="card p-5">
            <h2 className="mb-3 text-sm font-semibold text-ink">{t("dash.progress")}</h2>
            <div className="flex items-center gap-5">
              <ProgressRing percent={overall} />
              <div className="space-y-2 text-sm">
                <Stat color="bg-emerald-500" label={t("dash.completed")} value={counts.completed} />
                <Stat color="bg-amber-500" label={t("dash.inProgress")} value={counts.inProgress} />
                <Stat color="bg-slate-300" label={t("dash.notStarted")} value={counts.notStarted} />
              </div>
            </div>
          </section>

          <FeedbackCard week={currentWeek} />

          {/* Next up */}
          {nextWeek && (
            <section className="card p-5">
              <h2 className="text-sm font-semibold text-ink">
                {t("dash.nextUp", { week: nextWeek.week_number })}
              </h2>
              <p className="mt-1 font-medium text-ink">{nextWeek.title}</p>
              <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                {nextWeek.topics.slice(0, 3).map((t, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary">•</span> {t.name}
                  </li>
                ))}
              </ul>
              <Link
                href={`/plan/${nextWeek.week_number}`}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {t("dash.viewFullWeek")} <ArrowRight size={14} />
              </Link>
            </section>
          )}

          {/* Tip card */}
          <section className="card flex items-center gap-4 bg-primary-light p-5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-primary">
              <Laptop size={22} />
            </div>
            <p className="text-sm text-ink">
              <span className="font-semibold">{t("dash.tipBold")}</span> {t("dash.tipText")}
            </p>
          </section>

          {state.adaptationNote && (
            <p className="rounded-lg border border-primary/20 bg-primary-light px-4 py-3 text-xs text-primary">
              🧠 {state.adaptationNote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({
  icon,
  label,
  tone,
}: {
  icon?: React.ReactNode;
  label: string;
  tone?: "primary";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        tone === "primary"
          ? "bg-primary text-white"
          : "bg-slate-100 text-ink"
      }`}
    >
      {icon}
      {label}
    </span>
  );
}

function Stat({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-ink-soft">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}
