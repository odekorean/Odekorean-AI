import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Clock, GraduationCap } from "lucide-react";

export default async function TopikCenterPage() {
  const supabase = await createClient();
  const { data: exams } = await supabase
    .from("topik_exams")
    .select("*")
    .eq("is_published", true)
    .order("level");

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl font-bold">TOPIK Center</h1>
      <p className="mt-1 text-graphite/60">
        Full-length mock exams with a real timer and instant, detailed grading.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {(exams ?? []).map((exam) => (
          <Card key={exam.id}>
            <div className="flex items-center gap-2 text-aurora-indigo">
              <GraduationCap size={18} />
              <span className="text-sm font-semibold">{exam.level.replace("_", " ")}</span>
            </div>
            <h2 className="mt-2 font-display text-lg font-semibold">{exam.title}</h2>
            <p className="mt-1 text-sm text-graphite/60">{exam.description}</p>
            <div className="mt-4 flex items-center gap-1 text-sm text-graphite/50">
              <Clock size={14} /> {exam.time_limit_minutes} minutes
            </div>
            <Link
              href={`/topik/${exam.id}`}
              className="mt-4 inline-flex rounded-full bg-gradient-to-r from-aurora-blue to-aurora-indigo px-5 py-2.5 text-sm font-semibold text-white"
            >
              Start mock exam
            </Link>
          </Card>
        ))}
        {(!exams || exams.length === 0) && (
          <p className="text-graphite/50">No mock exams published yet — check back soon.</p>
        )}
      </div>
    </main>
  );
}
