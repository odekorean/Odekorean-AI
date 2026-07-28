import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Users, BookOpen, Sparkles, TrendingUp } from "lucide-react";

async function count(supabase: any, table: string, filters: (q: any) => any = (q) => q) {
  const { count } = await filters(supabase.from(table).select("*", { count: "exact", head: true }));
  return count ?? 0;
}

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [totalUsers, newUsers30d, totalLessons, publishedLessons, aiUsage30d] = await Promise.all([
    count(supabase, "profiles"),
    count(supabase, "profiles", (q) => q.gte("created_at", since30d)),
    count(supabase, "lessons"),
    count(supabase, "lessons", (q) => q.eq("status", "published")),
    count(supabase, "ai_usage_logs", (q) => q.gte("created_at", since30d)),
  ]);

  const stats = [
    { label: "Total students", value: totalUsers, icon: Users },
    { label: "New signups (30d)", value: newUsers30d, icon: TrendingUp },
    { label: "Published lessons", value: `${publishedLessons}/${totalLessons}`, icon: BookOpen },
    { label: "AI Teacher uses (30d)", value: aiUsage30d, icon: Sparkles },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-3xl font-bold">Admin overview</h1>
      <p className="mt-1 text-graphite/60">Platform health at a glance.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <Icon className="text-aurora-indigo" size={20} />
            <p className="mt-3 font-display text-3xl font-bold">{value}</p>
            <p className="mt-1 text-sm text-graphite/60">{label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 rounded-xl3 border border-dashed border-line bg-white p-6 text-sm text-graphite/60">
        Revenue statistics will populate here once the Stripe subscription
        integration (architecture already in `subscriptions` table) is connected in Phase 2.
      </div>
    </main>
  );
}
