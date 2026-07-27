import { createClient } from "@/lib/supabase/server";
import { VideoPlayer } from "@/components/student/VideoPlayer";
import { PdfViewer } from "@/components/student/PdfViewer";
import { Card } from "@/components/ui/Card";
import { notFound } from "next/navigation";
import { Bookmark, CheckCircle2 } from "lucide-react";

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*, categories(name)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!lesson) notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <p className="text-sm font-medium text-aurora-indigo">{lesson.categories?.name ?? "Lesson"}</p>
      <div className="mt-1 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">{lesson.title}</h1>
        <div className="flex gap-2">
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-line hover:bg-mist">
            <Bookmark size={18} />
          </button>
        </div>
      </div>
      {lesson.description && <p className="mt-2 text-graphite/70">{lesson.description}</p>}

      <div className="mt-6 space-y-6">
        {lesson.type === "video" && (
          <VideoPlayer youtubeId={lesson.youtube_id} videoUrl={lesson.video_url} />
        )}

        {lesson.type === "pdf" && lesson.pdf_url && (
          <PdfViewer url={lesson.pdf_url} title={lesson.title} />
        )}

        {(lesson.type === "vocabulary" || lesson.type === "grammar") && (
          <Card>
            <pre className="whitespace-pre-wrap font-body text-sm text-graphite/80">
              {JSON.stringify(lesson.content, null, 2)}
            </pre>
            <p className="mt-4 text-xs text-graphite/40">
              Rendered from structured `content` JSON — swap in a dedicated
              VocabularyList / GrammarNote component for production polish.
            </p>
          </Card>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-aurora-blue to-aurora-indigo px-6 py-3 font-semibold text-white">
          <CheckCircle2 size={18} /> Mark as complete
        </button>
      </div>
    </main>
  );
}
