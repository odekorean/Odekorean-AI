import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ActivityChart } from "@/components/student/ActivityChart";
import { Award, Flame, BookOpenCheck } from "lucide-react";

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: streak }, { data: completedLessons }, { data: achievements }, { data: weeklyGoal }] =
    await Promise.all([
      supabase.from("streaks").select("*").eq("user_id", user?.id).single(),
      supabase.from("lesson_progress").select("*, lessons(title)").eq("user_id", user?.id).eq("completed", true),
      supabase.from("user_achievements").select("*, achievements(*)").eq("user_id", user?.id),
      supabase.from("weekly_goals").select("*").eq("user_id", user?.id).order("week_start", { ascending: false }).limit(1).single(),
    ]);

  // Placeholder weekly activity shape — replace with a real aggregation query
  // (e.g. a Postgres function summing lesson_progress deltas per day) once
  // per-session time tracking is implemented.
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const chartData = days.map((day) => ({
    day,
    minutes: Math.round(((weeklyGoal?.minutes_completed ?? 0) / 7) * (0.6 + Math.random() * 0.8)),
  }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-3xl font-bold">Progress</h1>
      <p className="mt-1 text-graphite/60">Your daily, weekly, and monthly learning story.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-aurora-vermilion/10 text-aurora-vermilion">
            <Flame size={22} />
          </span>
          <div>
            <p className="font-display text-2xl font-bold">{streak?.current_streak ?? 0}</p>
            <p className="text-sm text-graphite/60">Day streak (best: {streak?.longest_streak ?? 0})</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-aurora-blue/10 text-aurora-blue">
            <BookOpenCheck size={22} />
          </span>
          <div>
            <p className="font-display text-2xl font-bold">{completedLessons?.length ?? 0}</p>
            <p className="text-sm text-graphite/60">Lessons completed</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-aurora-gold/10 text-aurora-gold">
            <Award size={22} />
          </span>
          <div>
            <p className="font-display text-2xl font-bold">{achievements?.length ?? 0}</p>
            <p className="text-sm text-graphite/60">Achievements earned</p>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="font-display text-lg font-semibold">This week's activity</h2>
          <div className="mt-2">
            <ActivityChart data={chartData} />
          </div>
        </Card>
        <Card className="flex flex-col items-center justify-center text-center">
          <h2 className="font-display text-lg font-semibold">Weekly goal</h2>
          <div className="mt-4">
            <ProgressRing
              percent={
                weeklyGoal ? Math.min(100, Math.round(((weeklyGoal.minutes_completed ?? 0) / (weeklyGoal.target_minutes || 1)) * 100)) : 0
              }
            />
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="font-display text-lg font-semibold">Achievements</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(achievements ?? []).map((a: any) => (
            <div key={a.achievement_id} className="flex flex-col items-center rounded-xl2 border border-line p-4 text-center">
              <span className="text-2xl">{a.achievements?.icon ?? "🏅"}</span>
              <p className="mt-2 text-sm font-medium">{a.achievements?.title}</p>
            </div>
          ))}
          {(!achievements || achievements.length === 0) && (
            <p className="col-span-full text-sm text-graphite/50">
              No achievements yet — complete lessons and quizzes to start earning them.
            </p>
          )}
        </div>
      </Card>
    </main>
  );
}
