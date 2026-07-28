import { createClient } from "@/lib/supabase/server";
import { QuizBuilder } from "@/components/admin/QuizBuilder";
import { deleteQuiz } from "@/app/(admin)/admin/quizzes/actions";
import { notFound } from "next/navigation";

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: quiz }, { data: questions }, { data: lessons }] = await Promise.all([
    supabase.from("quizzes").select("*").eq("id", id).single(),
    supabase.from("quiz_questions").select("*").eq("quiz_id", id).order("sort_order"),
    supabase.from("lessons").select("id,title").order("title"),
  ]);

  if (!quiz) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Edit quiz</h1>
        <form action={async () => { "use server"; await deleteQuiz(id); }}>
          <button className="text-sm font-semibold text-danger">Delete quiz</button>
        </form>
      </div>
      <div className="mt-8">
        <QuizBuilder
          lessons={lessons ?? []}
          initial={{ ...quiz, questions: (questions ?? []) as any }}
        />
      </div>
    </main>
  );
}
