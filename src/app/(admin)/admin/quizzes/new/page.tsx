import { createClient } from "@/lib/supabase/server";
import { QuizBuilder } from "@/components/admin/QuizBuilder";

export default async function NewQuizPage() {
  const supabase = await createClient();
  const { data: lessons } = await supabase.from("lessons").select("id,title").order("title");

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl font-bold">New quiz</h1>
      <div className="mt-8">
        <QuizBuilder lessons={lessons ?? []} />
      </div>
    </main>
  );
}
