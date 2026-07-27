"use client";

import { useState } from "react";
import { saveQuiz, generateQuizQuestionsWithAi, type QuizInput, type QuizQuestionInput } from "@/app/(admin)/admin/quizzes/actions";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, Sparkles, GripVertical } from "lucide-react";

const QUESTION_TYPES: QuizQuestionInput["type"][] = ["multiple_choice", "fill_blank", "listening", "topik"];

function emptyQuestion(type: QuizQuestionInput["type"] = "multiple_choice"): QuizQuestionInput {
  return {
    type,
    prompt: "",
    options: [
      { id: "a", text: "" },
      { id: "b", text: "" },
      { id: "c", text: "" },
      { id: "d", text: "" },
    ],
    correct_answer: "a",
    explanation: "",
    points: 1,
  };
}

export function QuizBuilder({
  lessons,
  initial,
}: {
  lessons: { id: string; title: string }[];
  initial?: Partial<QuizInput>;
}) {
  const [quiz, setQuiz] = useState<QuizInput>({
    id: initial?.id,
    title: initial?.title ?? "",
    lesson_id: initial?.lesson_id,
    instructions: initial?.instructions ?? "",
    time_limit_seconds: initial?.time_limit_seconds,
    pass_score_percent: initial?.pass_score_percent ?? 60,
    questions: initial?.questions?.length ? initial.questions : [emptyQuestion()],
  });
  const [saving, setSaving] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiLevel, setAiLevel] = useState("beginner");
  const [generating, setGenerating] = useState(false);

  function updateQuestion(index: number, patch: Partial<QuizQuestionInput>) {
    setQuiz((q) => ({
      ...q,
      questions: q.questions.map((qq, i) => (i === index ? { ...qq, ...patch } : qq)),
    }));
  }

  function updateOption(qIndex: number, optId: string, text: string) {
    setQuiz((q) => ({
      ...q,
      questions: q.questions.map((qq, i) =>
        i === qIndex ? { ...qq, options: qq.options.map((o) => (o.id === optId ? { ...o, text } : o)) } : qq
      ),
    }));
  }

  function addQuestion() {
    setQuiz((q) => ({ ...q, questions: [...q.questions, emptyQuestion()] }));
  }

  function removeQuestion(index: number) {
    setQuiz((q) => ({ ...q, questions: q.questions.filter((_, i) => i !== index) }));
  }

  async function handleAiGenerate() {
    if (!aiTopic.trim()) return;
    setGenerating(true);
    try {
      const generated = await generateQuizQuestionsWithAi(aiTopic, aiLevel, 5);
      const mapped: QuizQuestionInput[] = generated.map((g: any) => ({
        type: "multiple_choice",
        prompt: g.prompt,
        options: g.options,
        correct_answer: g.correct_answer,
        explanation: g.explanation,
        points: g.points ?? 1,
      }));
      if (mapped.length) {
        setQuiz((q) => ({ ...q, questions: [...q.questions.filter((qq) => qq.prompt), ...mapped] }));
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveQuiz(quiz);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-xl3 bg-white p-6 shadow-soft">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Quiz title</label>
            <input
              required
              value={quiz.title}
              onChange={(e) => setQuiz((q) => ({ ...q, title: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-line px-4 py-3"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Linked lesson</label>
            <select
              value={quiz.lesson_id ?? ""}
              onChange={(e) => setQuiz((q) => ({ ...q, lesson_id: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-line px-4 py-3"
            >
              <option value="">— None —</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Time limit (seconds, optional)</label>
            <input
              type="number"
              value={quiz.time_limit_seconds ?? ""}
              onChange={(e) => setQuiz((q) => ({ ...q, time_limit_seconds: Number(e.target.value) || undefined }))}
              className="mt-1 w-full rounded-xl border border-line px-4 py-3"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Pass score (%)</label>
            <input
              type="number"
              value={quiz.pass_score_percent}
              onChange={(e) => setQuiz((q) => ({ ...q, pass_score_percent: Number(e.target.value) }))}
              className="mt-1 w-full rounded-xl border border-line px-4 py-3"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="text-sm font-medium">Instructions</label>
          <textarea
            value={quiz.instructions}
            onChange={(e) => setQuiz((q) => ({ ...q, instructions: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-line px-4 py-3"
            rows={2}
          />
        </div>
      </div>

      <div className="rounded-xl3 border border-dashed border-aurora-indigo/30 bg-aurora-indigo/5 p-5">
        <div className="flex items-center gap-2 font-display font-semibold text-aurora-indigo">
          <Sparkles size={16} /> Draft questions with AI
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            placeholder="Topic, e.g. 'past tense verb endings'"
            className="flex-1 rounded-xl border border-line px-4 py-2.5 text-sm"
          />
          <select
            value={aiLevel}
            onChange={(e) => setAiLevel(e.target.value)}
            className="rounded-xl border border-line px-4 py-2.5 text-sm"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <Button type="button" variant="secondary" onClick={handleAiGenerate} disabled={generating}>
            {generating ? "Generating…" : "Generate 5 questions"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {quiz.questions.map((q, i) => (
          <div key={i} className="rounded-xl3 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-graphite/40">
                <GripVertical size={16} />
                <span className="text-sm">Question {i + 1}</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={q.type}
                  onChange={(e) => updateQuestion(i, { type: e.target.value as QuizQuestionInput["type"] })}
                  className="rounded-full border border-line px-3 py-1 text-xs capitalize"
                >
                  {QUESTION_TYPES.map((t) => (
                    <option key={t} value={t}>{t.replace("_", " ")}</option>
                  ))}
                </select>
                <button type="button" onClick={() => removeQuestion(i)} className="text-danger">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <textarea
              value={q.prompt}
              onChange={(e) => updateQuestion(i, { prompt: e.target.value })}
              placeholder="Question prompt"
              className="mt-3 w-full rounded-xl border border-line px-4 py-3 text-sm"
              rows={2}
            />

            {q.type === "listening" && (
              <input
                value={q.prompt_audio_url ?? ""}
                onChange={(e) => updateQuestion(i, { prompt_audio_url: e.target.value })}
                placeholder="Audio file URL"
                className="mt-2 w-full rounded-xl border border-line px-4 py-2.5 text-sm"
              />
            )}

            {q.type === "fill_blank" ? (
              <input
                value={typeof q.correct_answer === "string" ? q.correct_answer : ""}
                onChange={(e) => updateQuestion(i, { correct_answer: e.target.value })}
                placeholder="Correct answer text"
                className="mt-2 w-full rounded-xl border border-line px-4 py-2.5 text-sm"
              />
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {q.options.map((opt) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={q.correct_answer === opt.id}
                      onChange={() => updateQuestion(i, { correct_answer: opt.id })}
                    />
                    <input
                      value={opt.text}
                      onChange={(e) => updateOption(i, opt.id, e.target.value)}
                      placeholder={`Option ${opt.id.toUpperCase()}`}
                      className="flex-1 rounded-xl border border-line px-3 py-2 text-sm"
                    />
                  </div>
                ))}
              </div>
            )}

            <input
              value={q.explanation ?? ""}
              onChange={(e) => updateQuestion(i, { explanation: e.target.value })}
              placeholder="Explanation shown after grading (optional)"
              className="mt-3 w-full rounded-xl border border-line px-4 py-2.5 text-sm"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addQuestion}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line py-3 text-sm font-medium text-graphite/60 hover:bg-mist"
      >
        <Plus size={16} /> Add question
      </button>

      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save quiz"}
      </Button>
    </form>
  );
}
