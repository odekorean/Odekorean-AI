"use server";

import { createClient } from "@/lib/supabase/server";
import { extractYoutubeId } from "@/components/student/VideoPlayer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type LessonInput = {
  id?: string;
  title: string;
  slug: string;
  description?: string;
  language_id: string;
  category_id?: string;
  type: "video" | "pdf" | "vocabulary" | "grammar" | "topik" | "speaking" | "listening" | "reading" | "writing";
  status: "draft" | "published";
  video_source?: "youtube" | "upload";
  video_url?: string;
  pdf_url?: string;
  is_premium?: boolean;
};

export async function saveLesson(input: LessonInput) {
  const supabase = await createClient();

  const payload: Record<string, unknown> = {
    title: input.title,
    slug: input.slug,
    description: input.description,
    language_id: input.language_id,
    category_id: input.category_id || null,
    type: input.type,
    status: input.status,
    is_premium: input.is_premium ?? false,
    published_at: input.status === "published" ? new Date().toISOString() : null,
  };

  if (input.type === "video") {
    payload.video_source = input.video_source;
    if (input.video_source === "youtube" && input.video_url) {
      payload.youtube_id = extractYoutubeId(input.video_url);
      payload.video_url = input.video_url;
    } else {
      payload.video_url = input.video_url;
      payload.youtube_id = null;
    }
  }

  if (input.type === "pdf") {
    payload.pdf_url = input.pdf_url;
  }

  if (input.id) {
    const { error } = await supabase.from("lessons").update(payload).eq("id", input.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("lessons").insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/lessons");
  redirect("/admin/lessons");
}

export async function deleteLesson(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/lessons");
}

// Uploads a file (thumbnail or PDF) to the `lesson-assets` Supabase Storage bucket
// and returns its public URL. Create this bucket (public) in Supabase Storage first.
export async function uploadLessonAsset(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const path = `${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from("lesson-assets").upload(path, file, {
    upsert: true,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("lesson-assets").getPublicUrl(path);
  return data.publicUrl;
}
