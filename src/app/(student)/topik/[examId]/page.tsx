import { createClient } from "@/lib/supabase/server";
import { TopikExamRunner } from "@/components/student/TopikExamRunner";
import { notFound } from "next/navigation";

export default async function TopikExamPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  const supabase = await createClient();

  const { data: exam } = await supabase.from("topik_exams").select("*").eq("id", examId).single();
  if (!exam) notFound();

  const { data: sections } = await supabase
    .from("topik_exam_sections")
    .select("id")
    .eq("exam_id", examId);

  const sectionIds = (sections ?? []).map((s) => s.id);
  const { data: questions } = await supabase
    .from("topik_questions")
    .select("*")
    .in("section_id", sectionIds.length ? sectionIds : ["00000000-0000-0000-0000-000000000000"])
    .order("sort_order");

  return (
    <main className="min-h-screen bg-mist px-6 py-10">
      <TopikExamRunner
        examId={exam.id}
        timeLimitMinutes={exam.time_limit_minutes}
        questions={(questions ?? []) as any}
      />
    </main>
  );
}
