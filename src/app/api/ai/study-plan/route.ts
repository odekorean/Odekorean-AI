import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(_req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("current_level").eq("id", user.id).single();
  const { data: recentCompletions } = await supabase
    .from("lesson_progress")
    .select("lessons(title,type)")
    .eq("user_id", user.id)
    .eq("completed", true)
    .order("completed_at", { ascending: false })
    .limit(5);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 512,
    system:
      'You generate a short daily Korean-study plan. Respond ONLY with a JSON array, no prose, no markdown fences. ' +
      'Each item: {"type": "lesson"|"quiz"|"ai_teacher"|"vocabulary"|"speaking", "title": string, "minutes": number}. 3-5 items totalling 20-40 minutes.',
    messages: [
      {
        role: "user",
        content: `Student level: ${profile?.current_level ?? "beginner"}. Recently completed: ${
          (recentCompletions ?? []).map((r: any) => r.lessons?.title).filter(Boolean).join(", ") || "nothing yet"
        }. Build today's plan.`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === "text");
  const text = block && "text" in block ? block.text : "[]";
  let tasks: unknown[] = [];
  try {
    tasks = JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    tasks = [];
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: saved, error } = await supabase
    .from("daily_plans")
    .upsert({ user_id: user.id, plan_date: today, tasks, generated_by: "ai" }, { onConflict: "user_id,plan_date" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plan: saved });
}
