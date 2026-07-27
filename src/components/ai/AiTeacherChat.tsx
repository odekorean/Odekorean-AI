"use client";

import { useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Explain 이/가 vs 은/는",
  "Give me 5 TOPIK I vocabulary questions",
  "Correct this sentence: 저는 학생이에요 어제",
  "Build today's study plan for a beginner",
];

export function AiTeacherChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "안녕하세요! I'm your AI Korean teacher. Ask me about grammar, vocabulary, or paste a sentence you'd like corrected. 이/가 vs 은/는 같은 것도 물어보세요!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send(content: string) {
    if (!content.trim() || loading) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, conversationId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      setConversationId(data.conversationId);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry, I couldn't respond just now — please try again." },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight));
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col rounded-xl3 bg-white shadow-soft">
      <header className="flex items-center gap-3 border-b border-line px-6 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-aurora-blue to-aurora-indigo text-white">
          <Sparkles size={18} />
        </div>
        <div>
          <p className="font-display font-semibold">AI Teacher · 선생님</p>
          <p className="text-xs text-graphite/50">Grammar · Corrections · TOPIK · Study plans</p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-gradient-to-br from-aurora-blue to-aurora-indigo text-white"
                  : "bg-mist text-graphite"
              )}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-mist px-4 py-3 text-sm text-graphite/50">
              선생님이 입력 중… (typing)
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 px-6 pb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-line px-3 py-1.5 text-xs text-graphite/70 hover:bg-mist"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-line p-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about grammar, vocabulary, or paste a sentence to correct…"
          className="flex-1 rounded-full border border-line px-4 py-3 text-sm outline-none focus:border-aurora-indigo"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-aurora-blue to-aurora-indigo text-white disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
