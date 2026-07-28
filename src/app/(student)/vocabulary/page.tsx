import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";

export default async function VocabularyPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; q?: string }>;
}) {
  const { level, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("vocabulary_items").select("*").order("term").limit(60);
  if (level) query = query.eq("topik_level", level);
  if (q) query = query.ilike("term", `%${q}%`);
  const { data: items } = await query;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-3xl font-bold">Vocabulary</h1>
      <p className="mt-1 text-graphite/60">Browse words with romanization, translation, and example sentences.</p>

      <form className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search a word…"
          className="flex-1 rounded-full border border-line bg-white px-5 py-3 text-sm"
        />
        <select name="level" defaultValue={level ?? ""} className="rounded-full border border-line bg-white px-5 py-3 text-sm">
          <option value="">All levels</option>
          <option value="TOPIK_I">TOPIK I</option>
          <option value="TOPIK_II">TOPIK II</option>
        </select>
        <button className="btn-primary">Filter</button>
      </form>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(items ?? []).map((v) => (
          <Card key={v.id}>
            <div className="flex items-baseline justify-between">
              <span className="font-kr text-xl font-bold">{v.term}</span>
              {v.romanization && <span className="text-sm text-graphite/40">{v.romanization}</span>}
            </div>
            <p className="mt-1 font-medium text-aurora-indigo">{v.translation}</p>
            {v.example_sentence && (
              <p className="mt-3 rounded-xl bg-mist p-3 font-kr text-sm">{v.example_sentence}</p>
            )}
            {v.example_translation && (
              <p className="mt-1 text-sm text-graphite/50">{v.example_translation}</p>
            )}
          </Card>
        ))}
        {(!items || items.length === 0) && (
          <p className="text-graphite/50">No vocabulary matches yet — try a different search.</p>
        )}
      </div>
    </main>
  );
}
