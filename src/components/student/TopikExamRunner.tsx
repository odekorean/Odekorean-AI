"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Clock } from "lucide-react";

type Question = {
  id: string;
  prompt: string;
  passage?: string | null;
  options: { id: string; text: string }[];
  correct_answer: string | string[];
  points: number;
  explanation?: string | null;
};

export function TopikExamRunner({
  examId,
  timeLimitMinutes,
  questions,
}: {
  examId: string;
  timeLimitMinutes: number;
  questions: Question[];
}) {
  const [secondsLeft, setSecondsLeft] = useState(timeLimitMinutes * 60);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);

  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          handleSubmit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  function selectAnswer(questionId: string, optionId: string) {
    setAnswers((a) => ({ ...a, [questionId]: optionId }));
  }

  async function handleSubmit() {
    if (submitted) return;
    let earned = 0;
    let total = 0;
    for (const q of questions) {
      total += q.points;
      const correct = Array.isArray(q.correct_answer) ? q.correct_answer[0] : q.correct_answer;
      if (answers[q.id] === correct) earned += q.points;
    }
    setResult({ score: earned, total });
    setSubmitted(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("topik_attempts").insert({
        exam_id: examId,
        user_id: user.id,
        answers,
        score: total ? Math.round((earned / total) * 100) : 0,
        status: "graded",
        submitted_at: new Date().toISOString(),
      });
    }
  }

  const progressCount = useMemo(() => Object.keys(answers).length, [answers]);

  if (submitted && result) {
    const percent = result.total ? Math.round((result.score / result.total) * 100) : 0;
    return (
      <div className="mx-auto max-w-2xl rounded-xl3 bg-white p-8 text-center shadow-softLg">
        <h2 className="font-display text-2xl font-bold">Exam complete</h2>
        <p className="mt-2 text-5xl font-bold gradient-text">{percent}%</p>
        <p className="mt-2 text-graphite/60">
          {result.score} / {result.total} points
        </p>
        <div className="mt-8 space-y-4 text-left">
          {questions.map((q) => {
            const correct = Array.isArray(q.correct_answer) ? q.correct_answer[0] : q.correct_answer;
            const isCorrect = answers[q.id] === correct;
            return (
              <div key={q.id} className={`rounded-xl border p-4 ${isCorrect ? "border-success/30 bg-success/5" : "border-danger/30 bg-danger/5"}`}>
                <p className="font-medium">{q.prompt}</p>
                {q.explanation && <p className="mt-1 text-sm text-graphite/60">{q.explanation}</p>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="sticky top-0 z-10 mb-6 flex items-center justify-between rounded-full bg-white px-6 py-3 shadow-soft">
        <span className="text-sm text-graphite/60">{progressCount}/{questions.length} answered</span>
        <div className="flex items-center gap-2 font-display font-semibold">
          <Clock size={16} className={secondsLeft < 60 ? "text-danger" : ""} />
          {mm}:{ss}
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, i) => (
          <div key={q.id} className="rounded-xl3 bg-white p-6 shadow-soft">
            <p className="text-sm text-graphite/40">Question {i + 1}</p>
            {q.passage && <p className="mt-2 rounded-xl bg-mist p-4 text-sm">{q.passage}</p>}
            <p className="mt-3 font-medium">{q.prompt}</p>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {q.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => selectAnswer(q.id, opt.id)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                    answers[q.id] === opt.id
                      ? "border-aurora-indigo bg-aurora-indigo/10"
                      : "border-line hover:bg-mist"
                  }`}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} className="btn-primary mt-8 w-full">
        Submit exam
      </button>
    </div>
  );
}
