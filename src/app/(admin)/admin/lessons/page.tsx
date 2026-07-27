import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Plus } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  video: "bg-aurora-blue/10 text-aurora-blue",
  pdf: "bg-aurora-vermilion/10 text-aurora-vermilion",
  vocabulary: "bg-aurora-gold/10 text-aurora-gold",
  grammar: "bg-aurora-indigo/10 text-aurora-indigo",
  topik: "bg-success/10 text-success",
};

export default async function AdminLessonsPage() {
  const supabase = await createClient();
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Lessons</h1>
          <p className="mt-1 text-graphite/60">Create and manage all learning content.</p>
        </div>
        <Link href="/admin/lessons/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New lesson
        </Link>
      </div>

      <Card className="mt-8 !p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-graphite/50">
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {(lessons ?? []).map((l) => (
              <tr key={l.id} className="border-b border-line last:border-0">
                <td className="px-6 py-3 font-medium">{l.title}</td>
                <td className="px-6 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${TYPE_COLORS[l.type] ?? "bg-mist"}`}>
                    {l.type}
                  </span>
                </td>
                <td className="px-6 py-3 text-graphite/60">{l.categories?.name ?? "—"}</td>
                <td className="px-6 py-3 capitalize text-graphite/60">{l.status}</td>
                <td className="px-6 py-3 text-right">
                  <Link href={`/admin/lessons/${l.id}`} className="font-medium text-aurora-indigo">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {(!lessons || lessons.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-graphite/50">
                  No lessons yet — create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </main>
  );
}
