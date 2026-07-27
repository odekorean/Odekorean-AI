"use client";

import { useState } from "react";
import { saveTopikExam, type TopikExamInput, type TopikSectionInput, type TopikQuestionInput } from "@/app/(admin)/admin/topik/actions";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2 } from "lucide-react";

function emptyQuestion(): TopikQuestionInput {
  return {
    type: "multiple_choice",
    prompt: "",
    passage: "",
    options: [
      { id: "a", text: "" }, { id: "b", text: "" }, { id: "c", text: "" }, { id: "d", text: "" },
    ],
    correct_answer: "a",
    explanation: "",
    points: 2,
  };
}
function emptySection(): TopikSectionInput {
  return { name: "Listening", questions: [emptyQuestion()] };
}

export function TopikExamBuilder({ initial }: { initial?: Partial<TopikExamInput> }) {
  const [exam, setExam] = useState<TopikExamInput>({
    id: initial?.id,
    level: initial?.level ?? "TOPIK_I",
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    time_limit_minutes: initial?.time_limit_minutes ?? 100,
    is_published: initial?.is_published ?? false,
    sections: initial?.sections?.length ? initial.sections : [emptySection()],
  });
  const [saving, setSaving] = useState(false);

  function updateSection(i: number, patch: Partial<TopikSectionInput>) {
    setExam((e) => ({ ...e, sections: e.sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) }));
  }
  function addSection() {
    setExam((e) => ({ ...e, sections: [...e.sections, emptySection()] }));
  }
  function removeSection(i: number) {
    setExam((e) => ({ ...e, sections: e.sections.filter((_, idx) => idx !== i) }));
  }
  function updateQuestion(sIdx: number, qIdx: number, patch: Partial<TopikQuestionInput>) {
    setExam((e) => ({
      ...e,
      sections: e.sections.map((s, idx) =>
        idx === sIdx ? { ...s, questions: s.questions.map((q, qi) => (qi === qIdx ? { ...q, ...patch } : q)) } : s
      ),
    }));
  }
  function updateOption(sIdx: number, qIdx: number, optId: string, text: string) {
    setExam((e) => ({
      ...e,
      sections: e.sections.map((s, idx) =>
        idx === sIdx
          ? {
              ...s,
              questions: s.questions.map((q, qi) =>
                qi === qIdx ? { ...q, options: q.options.map((o) => (o.id === optId ? { ...o, text } : o)) } : q
              ),
            }
          : s
      ),
    }));
  }
  function addQuestion(sIdx: number) {
    setExam((e) => ({
      ...e,
      sections: e.sections.map((s, idx) => (idx === sIdx ? { ...s, questions: [...s.questions, emptyQuestion()] } : s)),
    }));
  }
  function removeQuestion(sIdx: number, qIdx: number) {
    setExam((e) => ({
      ...e,
      sections: e.sections.map((s, idx) =>
        idx === sIdx ? { ...s, questions: s.questions.filter((_, qi) => qi !== qIdx) } : s
      ),
    }));
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSaving(true);
    try {
      await saveTopikExam(exam);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-xl3 bg-white p-6 shadow-soft">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Exam title</label>
            <input
              required
              value={exam.title}
              onChange={(e) => setExam((x) => ({ ...x, title: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-line px-4 py-3"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Level</label>
            <select
              value={exam.level}
              onChange={(e) => setExam((x) => ({ ...x, level: e.target.value as "TOPIK_I" | "TOPIK_II" }))}
              className="mt-1 w-full rounded-xl border border-line px-4 py-3"
            >
              <option value="TOPIK_I">TOPIK I</option>
              <option value="TOPIK_II">TOPIK II</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Time limit (minutes)</label>
            <input
              type="number"
              value={exam.time_limit_minutes}
              onChange={(e) => setExam((x) => ({ ...x, time_limit_minutes: Number(e.target.value) }))}
              className="mt-1 w-full rounded-xl border border-line px-4 py-3"
            />
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={exam.is_published}
                onChange={(e) => setExam((x) => ({ ...x, is_published: e.target.checked }))}
              />
              Published (visible to students)
            </label>
          </div>
        </div>
        <div className="mt-4">
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={exam.description}
            onChange={(e) => setExam((x) => ({ ...x, description: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-line px-4 py-3"
            rows={2}
          />
        </div>
      </div>

      {exam.sections.map((section, sIdx) => (
        <div key={sIdx} className="rounded-xl3 border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <input
              value={section.name}
              onChange={(e) => updateSection(sIdx, { name: e.target.value })}
              placeholder="Section name (e.g. Listening, Reading, Writing)"
              className="flex-1 rounded-xl border border-line px-4 py-2.5 font-display font-semibold"
            />
            <button type="button" onClick={() => removeSection(sIdx)} className="text-danger">
              <Trash2 size={18} />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {section.questions.map((q, qIdx) => (
              <div key={qIdx} className="rounded-xl2 bg-mist p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-graphite/50">Question {qIdx + 1}</span>
                  <button type="button" onClick={() => removeQuestion(sIdx, qIdx)} className="text-danger">
                    <Trash2 size={14} />
                  </button>
                </div>
                <textarea
                  value={q.passage}
                  onChange={(e) => updateQuestion(sIdx, qIdx, { passage: e.target.value })}
                  placeholder="Passage / listening transcript (optional)"
                  className="mt-2 w-full rounded-xl border border-line px-3 py-2 text-sm"
                  rows={2}
                />
                <input
                  value={q.audio_url}
                  onChange={(e) => updateQuestion(sIdx, qIdx, { audio_url: e.target.value })}
                  placeholder="Audio URL (for listening questions)"
                  className="mt-2 w-full rounded-xl border border-line px-3 py-2 text-sm"
                />
                <textarea
                  required
                  value={q.prompt}
                  onChange={(e) => updateQuestion(sIdx, qIdx, { prompt: e.target.value })}
                  placeholder="Question prompt"
                  className="mt-2 w-full rounded-xl border border-line px-3 py-2 text-sm"
                  rows={2}
                />
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {q.options.map((opt) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={q.correct_answer === opt.id}
                        onChange={() => updateQuestion(sIdx, qIdx, { correct_answer: opt.id })}
                      />
                      <input
                        value={opt.text}
                        onChange={(e) => updateOption(sIdx, qIdx, opt.id, e.target.value)}
                        placeholder={`Option ${opt.id.toUpperCase()}`}
                        className="flex-1 rounded-xl border border-line bg-white px-3 py-2 text-sm"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    value={q.explanation}
                    onChange={(e) => updateQuestion(sIdx, qIdx, { explanation: e.target.value })}
                    placeholder="Explanation shown after grading"
                    className="flex-1 rounded-xl border border-line bg-white px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    value={q.points}
                    onChange={(e) => updateQuestion(sIdx, qIdx, { points: Number(e.target.value) })}
                    className="w-20 rounded-xl border border-line bg-white px-3 py-2 text-sm"
                    title="Points"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addQuestion(sIdx)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line py-2.5 text-sm font-medium text-graphite/60 hover:bg-mist"
          >
            <Plus size={14} /> Add question to this section
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addSection}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-aurora-indigo/40 py-3 text-sm font-medium text-aurora-indigo hover:bg-aurora-indigo/5"
      >
        <Plus size={16} /> Add section
      </button>

      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save exam"}
      </Button>
    </form>
  );
}
