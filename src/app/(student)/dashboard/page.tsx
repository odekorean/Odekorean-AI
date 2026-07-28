import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { DailyPlanCard } from "@/components/student/DailyPlanCard";
import Link from "next/link";
import { Flame, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = new Date().toISOString().slice(0, 10);

  const [{ data: profile }, { data: streak }, { data: inProgress }, { data: weeklyGoal }, { data: todaysPlan }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user?.id).single(),
      supabase.from("streaks").select("*").eq("user_id", user?.id).single(),
      supabase
        .from("lesson_progress")
        .select("*, lessons(*)")
        .eq("user_id", user?.id)
        .eq("completed", false)
        .order("updated_at", { ascending: false })
        .limit(3),
      supabase.from("weekly_goals").select("*").eq("user_id", user?.id).order("week_start", { ascending: false }).limit(1).single(),
      supabase.from("daily_plans").select("*").eq("user_id", user?.id).eq("plan_date", today).single(),
    ]);

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";
  const weeklyPercent = weeklyGoal
    ? Math.min(100, Math.round(((weeklyGoal.minutes_completed ?? 0) / (weeklyGoal.target_minutes || 1)) * 100))
    : 0;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">
            안녕하세요, {firstName} 👋
          </h1>
          <p className="mt-1 text-graphite/60">Here's your learning snapshot for today.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-soft">
          <Flame className="text-aurora-vermilion" size={20} />
          <span className="font-semibold">{streak?.current_streak ?? 0} day streak</span>
        </div>
      </header>

      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Continue learning</h2>
            <Link href="/lessons" className="flex items-center gap-1 text-sm font-medium text-aurora-indigo">
              All lessons <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {inProgress && inProgress.length > 0 ? (
              inProgress.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/lessons/${p.lessons?.slug}`}
                  className="flex items-center justify-between rounded-xl border border-line p-4 transition-colors hover:bg-mist"
                >
                  <div>
                    <p className="font-medium">{p.lessons?.title}</p>
                    <p className="text-sm text-graphite/60">{p.progress_percent}% complete</p>
                  </div>
                  <ProgressRing percent={p.progress_percent ?? 0} size={48} strokeWidth={5} />
                </Link>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-line p-8 text-center text-graphite/60">
                No lessons in progress yet.{" "}
                <Link href="/lessons" className="font-semibold text-aurora-indigo">
                  Browse lessons
                </Link>{" "}
                to get started.
              </div>
            )}
          </div>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center">
          <h2 className="font-display text-lg font-semibold">This week's goal</h2>
          <div className="mt-4">
            <ProgressRing percent={weeklyPercent} label="of goal" />
          </div>
          <p className="mt-4 text-sm text-graphite/60">
            {weeklyGoal?.minutes_completed ?? 0} / {weeklyGoal?.target_minutes ?? 150} minutes this week
          </p>
        </Card>
      </section>

      <section className="mt-6">
        <Card>
          <h2 className="font-display text-lg font-semibold">Today's AI study plan</h2>
          <p className="mt-1 text-sm text-graphite/60">
            Generated for you based on your level and recent activity.
          </p>
          <DailyPlanCard initialTasks={(todaysPlan?.tasks as { type: string; title: string; minutes: number }[]) ?? []} />
        </Card>
      </section>
    </main>
  );
}
