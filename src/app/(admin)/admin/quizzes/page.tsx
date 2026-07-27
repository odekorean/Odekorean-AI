import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminQuizzesPage() {
  const supabase = await createClient();
  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("*, lessons(title), quiz_questions(id)")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Quizzes</h1>
          <p className="mt-1 text-graphite/60">Multiple choice, fill-in-the-blank, listening, TOPIK-style.</p>
        </div>
        <Link href="/admin/quizzes/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New quiz
        </Link>
      </div>

      <Card className="mt-8 !p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-graphite/50">
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">Linked lesson</th>
              <th className="px-6 py-3 font-medium">Questions</th>
              <th className="px-6 py-3 font-medium">Pass score</th>
              <th className="px-6 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {(quizzes ?? []).map((q: any) => (
              <tr key={q.id} className="border-b border-line last:border-0">
                <td className="px-6 py-3 font-medium">{q.title}</td>
                <td className="px-6 py-3 text-graphite/60">{q.lessons?.title ?? "—"}</td>
                <td className="px-6 py-3 text-graphite/60">{q.quiz_questions?.length ?? 0}</td>
                <td className="px-6 py-3 text-graphite/60">{q.pass_score_percent}%</td>
                <td className="px-6 py-3 text-right">
                  <Link href={`/admin/quizzes/${q.id}`} className="font-medium text-aurora-indigo">Edit</Link>
                </td>
              </tr>
            ))}
            {(!quizzes || quizzes.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-graphite/50">
                  No quizzes yet — create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </main>
  );
}
