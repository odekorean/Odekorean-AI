import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminTopikPage() {
  const supabase = await createClient();
  const { data: exams } = await supabase
    .from("topik_exams")
    .select("*, topik_exam_sections(id)")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">TOPIK exams</h1>
          <p className="mt-1 text-graphite/60">Author full mock exams with timed sections.</p>
        </div>
        <Link href="/admin/topik/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New exam
        </Link>
      </div>

      <Card className="mt-8 !p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-graphite/50">
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">Level</th>
              <th className="px-6 py-3 font-medium">Sections</th>
              <th className="px-6 py-3 font-medium">Time limit</th>
              <th className="px-6 py-3 font-medium">Published</th>
              <th className="px-6 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {(exams ?? []).map((e: any) => (
              <tr key={e.id} className="border-b border-line last:border-0">
                <td className="px-6 py-3 font-medium">{e.title}</td>
                <td className="px-6 py-3 text-graphite/60">{e.level.replace("_", " ")}</td>
                <td className="px-6 py-3 text-graphite/60">{e.topik_exam_sections?.length ?? 0}</td>
                <td className="px-6 py-3 text-graphite/60">{e.time_limit_minutes} min</td>
                <td className="px-6 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${e.is_published ? "bg-success/10 text-success" : "bg-mist text-graphite/50"}`}>
                    {e.is_published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <Link href={`/admin/topik/${e.id}`} className="font-medium text-aurora-indigo">Edit</Link>
                </td>
              </tr>
            ))}
            {(!exams || exams.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-graphite/50">
                  No exams yet — create your first mock exam.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </main>
  );
}
