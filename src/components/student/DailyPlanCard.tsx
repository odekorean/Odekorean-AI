"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Circle, Sparkles } from "lucide-react";

type Task = { type: string; title: string; minutes: number };

export function DailyPlanCard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/study-plan", { method: "POST" });
      const data = await res.json();
      if (data.plan?.tasks) setTasks(data.plan.tasks);
    } finally {
      setLoading(false);
    }
  }

  if (!tasks.length) {
    return (
      <button
        onClick={generate}
        disabled={loading}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-aurora-blue to-aurora-indigo px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        <Sparkles size={16} />
        {loading ? "Building your plan…" : "Ask your AI Teacher to build today's plan"}
        <ArrowRight size={14} />
      </button>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      {tasks.map((t, i) => (
        <button
          key={i}
          onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))}
          className="flex w-full items-center justify-between rounded-xl border border-line px-4 py-3 text-left text-sm hover:bg-mist"
        >
          <span className="flex items-center gap-3">
            {done[i] ? <CheckCircle2 className="text-success" size={18} /> : <Circle className="text-graphite/30" size={18} />}
            <span className={done[i] ? "line-through text-graphite/40" : ""}>{t.title}</span>
          </span>
          <span className="text-xs text-graphite/40">{t.minutes} min</span>
        </button>
      ))}
    </div>
  );
}
