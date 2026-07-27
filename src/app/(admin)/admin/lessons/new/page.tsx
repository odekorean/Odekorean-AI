import { createClient } from "@/lib/supabase/server";
import { LessonForm } from "@/components/admin/LessonForm";

export default async function NewLessonPage() {
  const supabase = await createClient();
  const [{ data: languages }, { data: categories }] = await Promise.all([
    supabase.from("languages").select("id,name").eq("is_active", true),
    supabase.from("categories").select("id,name"),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl font-bold">New lesson</h1>
      <div className="mt-8 rounded-xl3 bg-white p-6 shadow-soft">
        <LessonForm languages={languages ?? []} categories={categories ?? []} />
      </div>
    </main>
  );
}
