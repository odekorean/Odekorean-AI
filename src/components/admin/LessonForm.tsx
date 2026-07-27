"use client";

import { useState } from "react";
import { saveLesson, uploadLessonAsset, type LessonInput } from "@/app/(admin)/admin/lessons/actions";
import { extractYoutubeId } from "@/components/student/VideoPlayer";
import { Button } from "@/components/ui/Button";

const LESSON_TYPES: LessonInput["type"][] = [
  "video","pdf","vocabulary","grammar","topik","speaking","listening","reading","writing",
];

export function LessonForm({
  languages,
  categories,
  initial,
}: {
  languages: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  initial?: Partial<LessonInput>;
}) {
  const [form, setForm] = useState<LessonInput>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    language_id: initial?.language_id ?? languages[0]?.id ?? "",
    category_id: initial?.category_id,
    type: initial?.type ?? "video",
    status: initial?.status ?? "draft",
    video_source: initial?.video_source ?? "youtube",
    video_url: initial?.video_url ?? "",
    pdf_url: initial?.pdf_url ?? "",
    is_premium: initial?.is_premium ?? false,
    id: initial?.id,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const youtubeId = form.video_source === "youtube" ? extractYoutubeId(form.video_url ?? "") : null;

  async function handlePdfUpload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const url = await uploadLessonAsset(fd);
      setForm((f) => ({ ...f, pdf_url: url }));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveLesson(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-line px-4 py-3"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Slug (URL)</label>
          <input
            required
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-line px-4 py-3"
            placeholder="topik-1-basic-greetings"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="mt-1 w-full rounded-xl border border-line px-4 py-3"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="text-sm font-medium">Language</label>
          <select
            value={form.language_id}
            onChange={(e) => setForm((f) => ({ ...f, language_id: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-line px-4 py-3"
          >
            {languages.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Category</label>
          <select
            value={form.category_id ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-line px-4 py-3"
          >
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Lesson type</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as LessonInput["type"] }))}
            className="mt-1 w-full rounded-xl border border-line px-4 py-3 capitalize"
          >
            {LESSON_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {form.type === "video" && (
        <div className="rounded-xl2 border border-line p-4">
          <label className="text-sm font-medium">Video source</label>
          <div className="mt-2 flex gap-2">
            {(["youtube", "upload"] as const).map((src) => (
              <button
                type="button"
                key={src}
                onClick={() => setForm((f) => ({ ...f, video_source: src }))}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  form.video_source === src ? "bg-aurora-indigo text-white" : "bg-mist text-graphite/70"
                }`}
              >
                {src === "youtube" ? "Paste YouTube URL" : "Upload video file"}
              </button>
            ))}
          </div>
          <input
            className="mt-3 w-full rounded-xl border border-line px-4 py-3"
            placeholder={form.video_source === "youtube" ? "https://youtube.com/watch?v=..." : "Storage URL after upload"}
            value={form.video_url}
            onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))}
          />
          {form.video_source === "youtube" && youtubeId && (
            <div className="mt-3 aspect-video w-full max-w-sm overflow-hidden rounded-xl bg-black">
              <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${youtubeId}`} title="Preview" allowFullScreen />
            </div>
          )}
        </div>
      )}

      {form.type === "pdf" && (
        <div className="rounded-xl2 border border-line p-4">
          <label className="text-sm font-medium">PDF file</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => e.target.files?.[0] && handlePdfUpload(e.target.files[0])}
            className="mt-2 block text-sm"
          />
          {uploading && <p className="mt-1 text-sm text-graphite/50">Uploading…</p>}
          {form.pdf_url && <p className="mt-1 truncate text-sm text-success">Uploaded: {form.pdf_url}</p>}
        </div>
      )}

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.is_premium}
            onChange={(e) => setForm((f) => ({ ...f, is_premium: e.target.checked }))}
          />
          Premium-only lesson
        </label>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "draft" | "published" }))}
            className="rounded-xl border border-line px-3 py-2 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save lesson"}
      </Button>
    </form>
  );
}
