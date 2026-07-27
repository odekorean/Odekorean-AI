"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type TopikQuestionInput = {
  type: "multiple_choice" | "topik";
  prompt: string;
  passage?: string;
  audio_url?: string;
  options: { id: string; text: string }[];
  correct_answer: string;
  explanation?: string;
  points: number;
};

export type TopikSectionInput = {
  name: string;
  questions: TopikQuestionInput[];
};

export type TopikExamInput = {
  id?: string;
  level: "TOPIK_I" | "TOPIK_II";
  title: string;
  description?: string;
  time_limit_minutes: number;
  is_published: boolean;
  sections: TopikSectionInput[];
};

export async function saveTopikExam(input: TopikExamInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const totalPoints = input.sections.reduce(
    (sum, s) => sum + s.questions.reduce((a, q) => a + q.points, 0),
    0
  );

  let examId = input.id;
  const examPayload = {
    level: input.level,
    title: input.title,
    description: input.description,
    time_limit_minutes: input.time_limit_minutes,
    total_points: totalPoints || 100,
    is_published: input.is_published,
    created_by: user?.id,
  };

  if (examId) {
    const { error } = await supabase.from("topik_exams").update(examPayload).eq("id", examId);
    if (error) throw new Error(error.message);
    // Replace sections/questions wholesale on edit for simplicity.
    const { data: existingSections } = await supabase
      .from("topik_exam_sections")
      .select("id")
      .eq("exam_id", examId);
    if (existingSections?.length) {
      await supabase
        .from("topik_questions")
        .delete()
        .in("section_id", existingSections.map((s) => s.id));
      await supabase.from("topik_exam_sections").delete().eq("exam_id", examId);
    }
  } else {
    const { data, error } = await supabase.from("topik_exams").insert(examPayload).select("id").single();
    if (error) throw new Error(error.message);
    examId = data.id;
  }

  for (let i = 0; i < input.sections.length; i++) {
    const section = input.sections[i];
    const { data: sectionRow, error: sectionError } = await supabase
      .from("topik_exam_sections")
      .insert({ exam_id: examId, name: section.name, sort_order: i })
      .select("id")
      .single();
    if (sectionError) throw new Error(sectionError.message);

    const questionRows = section.questions.map((q, qi) => ({
      section_id: sectionRow.id,
      type: q.type,
      prompt: q.prompt,
      passage: q.passage || null,
      audio_url: q.audio_url || null,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      points: q.points,
      sort_order: qi,
    }));
    if (questionRows.length) {
      const { error } = await supabase.from("topik_questions").insert(questionRows);
      if (error) throw new Error(error.message);
    }
  }

  revalidatePath("/admin/topik");
  redirect("/admin/topik");
}

export async function deleteTopikExam(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("topik_exams").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/topik");
}
