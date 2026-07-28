import { createClient } from "@/lib/supabase/server";
import { LessonForm } from "@/components/admin/LessonForm";
import { deleteLesson } from "@/app/(admin)/admin/lessons/actions";
import { notFound } from "next/navigation";

export default async function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: lesson }, { data: languages }, { data: categories }] = await Promise.all([
    supabase.from("lessons").select("*").eq("id", id).single(),
    supabase.from("languages").select("id,name").eq("is_active", true),
    supabase.from("categories").select("id,name"),
  ]);

  if (!lesson) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Edit lesson</h1>
        <form action={async () => { "use server"; await deleteLesson(id); }}>
          <button className="text-sm font-semibold text-danger">Delete lesson</button>
        </form>
      </div>
      <div className="mt-8 rounded-xl3 bg-white p-6 shadow-soft">
        <LessonForm languages={languages ?? []} categories={categories ?? []} initial={lesson} />
      </div>
    </main>
  );
}
