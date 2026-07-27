import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { PlayCircle, FileText, BookOpen, Mic, Headphones, GraduationCap } from "lucide-react";

const TYPE_ICON: Record<string, any> = {
  video: PlayCircle,
  pdf: FileText,
  vocabulary: BookOpen,
  grammar: BookOpen,
  speaking: Mic,
  listening: Headphones,
  topik: GraduationCap,
};

export default async function LessonsLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  const [{ data: categories }, lessonsQuery] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    (async () => {
      let q = supabase.from("lessons").select("*, categories(name)").eq("status", "published").order("sort_order");
      if (category) q = q.eq("category_id", category);
      return q;
    })(),
  ]);
  const { data: lessons } = lessonsQuery;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-3xl font-bold">Lessons</h1>
      <p className="mt-1 text-graphite/60">Video, PDF, vocabulary, grammar, and TOPIK-focused lessons.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/lessons"
          className={`rounded-full px-4 py-2 text-sm font-medium ${!category ? "bg-aurora-indigo text-white" : "bg-white text-graphite/70 border border-line"}`}
        >
          All
        </Link>
        {(categories ?? []).map((c) => (
          <Link
            key={c.id}
            href={`/lessons?category=${c.id}`}
            className={`rounded-full px-4 py-2 text-sm font-medium ${category === c.id ? "bg-aurora-indigo text-white" : "bg-white text-graphite/70 border border-line"}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(lessons ?? []).map((l) => {
          const Icon = TYPE_ICON[l.type] ?? BookOpen;
          return (
            <Link key={l.id} href={`/lessons/${l.slug}`}>
              <Card className="h-full">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-aurora-indigo/10 text-aurora-indigo">
                    <Icon size={18} />
                  </span>
                  {l.is_premium && (
                    <span className="rounded-full bg-aurora-gold/10 px-2.5 py-1 text-xs font-medium text-aurora-gold">
                      Premium
                    </span>
                  )}
                </div>
                <h3 className="mt-4 font-display font-semibold">{l.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-graphite/60">{l.description}</p>
                <p className="mt-3 text-xs uppercase tracking-wide text-graphite/40">
                  {l.categories?.name ?? l.type} · {l.level}
                </p>
              </Card>
            </Link>
          );
        })}
        {(!lessons || lessons.length === 0) && (
          <p className="text-graphite/50">No lessons published yet in this category.</p>
        )}
      </div>
    </main>
  );
}
