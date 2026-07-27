"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type QuizQuestionInput = {
  id?: string;
  type: "multiple_choice" | "fill_blank" | "listening" | "topik";
  prompt: string;
  prompt_audio_url?: string;
  options: { id: string; text: string }[];
  correct_answer: string;
  explanation?: string;
  points: number;
};

export type QuizInput = {
  id?: string;
  lesson_id?: string;
  title: string;
  instructions?: string;
  time_limit_seconds?: number;
  pass_score_percent: number;
  questions: QuizQuestionInput[];
};

export async function saveQuiz(input: QuizInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let quizId = input.id;

  const quizPayload = {
    lesson_id: input.lesson_id || null,
    title: input.title,
    instructions: input.instructions,
    time_limit_seconds: input.time_limit_seconds || null,
    pass_score_percent: input.pass_score_percent,
    created_by: user?.id,
  };

  if (quizId) {
    const { error } = await supabase.from("quizzes").update(quizPayload).eq("id", quizId);
    if (error) throw new Error(error.message);
    // Simplest consistent strategy: replace all questions on save.
    await supabase.from("quiz_questions").delete().eq("quiz_id", quizId);
  } else {
    const { data, error } = await supabase.from("quizzes").insert(quizPayload).select("id").single();
    if (error) throw new Error(error.message);
    quizId = data.id;
  }

  const rows = input.questions.map((q, i) => ({
    quiz_id: quizId,
    type: q.type,
    prompt: q.prompt,
    prompt_audio_url: q.prompt_audio_url || null,
    options: q.options,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    points: q.points,
    sort_order: i,
  }));

  if (rows.length) {
    const { error } = await supabase.from("quiz_questions").insert(rows);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/quizzes");
  redirect("/admin/quizzes");
}

export async function deleteQuiz(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("quizzes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/quizzes");
}

// Uses Claude to draft quiz questions from a topic/level, which the admin
// then reviews and edits before saving — speeds up quiz authoring.
export async function generateQuizQuestionsWithAi(topic: string, level: string, count: number) {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 2048,
    system:
      "You generate Korean-language quiz questions for OdeKorean. Respond ONLY with a JSON array, no prose, no markdown fences. " +
      'Each item: {"prompt": string, "options": [{"id":"a","text":string},...4 options], "correct_answer": "a"|"b"|"c"|"d", "explanation": string, "points": 1}',
    messages: [
      {
        role: "user",
        content: `Generate ${count} multiple-choice quiz questions about "${topic}" for a ${level}-level Korean learner.`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === "text");
  const text = block && "text" in block ? block.text : "[]";
  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return [];
  }
}
