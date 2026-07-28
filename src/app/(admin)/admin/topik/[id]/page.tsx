import { createClient } from "@/lib/supabase/server";
import { TopikExamBuilder } from "@/components/admin/TopikExamBuilder";
import { deleteTopikExam } from "@/app/(admin)/admin/topik/actions";
import { notFound } from "next/navigation";

export default async function EditTopikExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: exam } = await supabase.from("topik_exams").select("*").eq("id", id).single();
  if (!exam) notFound();

  const { data: sections } = await supabase
    .from("topik_exam_sections")
    .select("*, topik_questions(*)")
    .eq("exam_id", id)
    .order("sort_order");

  const nestedSections = (sections ?? []).map((s: any) => ({
    name: s.name,
    questions: (s.topik_questions ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order),
  }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Edit TOPIK exam</h1>
        <form action={async () => { "use server"; await deleteTopikExam(id); }}>
          <button className="text-sm font-semibold text-danger">Delete exam</button>
        </form>
      </div>
      <div className="mt-8">
        <TopikExamBuilder initial={{ ...exam, sections: nestedSections }} />
      </div>
    </main>
  );
}
