import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are "Sonsaengnim", the AI Korean teacher inside OdeKorean, a Korean-learning
platform used mainly by Uzbek-speaking students preparing for TOPIK and life/work in Korea.

Your job:
- Explain Korean grammar and vocabulary clearly, with romanization and example sentences.
- Gently correct mistakes in the student's Korean, explaining *why*, not just *what*.
- Generate practice exercises and TOPIK-style questions when asked.
- Adapt explanations to the student's stated level (beginner/intermediate/advanced).
- Be warm, encouraging, and concise — this is a chat interface on mobile, favor short
  paragraphs and clear structure over long essays.
- When useful, respond bilingually: Korean text followed by an Uzbek or English gloss.

You are not a general-purpose assistant — stay focused on Korean language learning,
TOPIK preparation, and closely related study-skills questions.`;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages, conversationId } = (await req.json()) as {
    messages: { role: "user" | "assistant"; content: string }[];
    conversationId?: string;
  };

  if (!messages?.length) {
    return NextResponse.json({ error: "messages is required" }, { status: 400 });
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const reply = textBlock && "text" in textBlock ? textBlock.text : "";

    // Persist conversation + usage (fire-and-forget-safe: awaited for correctness)
    let convoId = conversationId;
    if (!convoId) {
      const { data } = await supabase
        .from("ai_conversations")
        .insert({ user_id: user.id, title: messages[0].content.slice(0, 60) })
        .select("id")
        .single();
      convoId = data?.id;
    }
    if (convoId) {
      const lastUserMsg = messages[messages.length - 1];
      await supabase.from("ai_messages").insert([
        { conversation_id: convoId, role: "user", content: lastUserMsg.content },
        { conversation_id: convoId, role: "assistant", content: reply, tokens_used: response.usage.output_tokens },
      ]);
    }
    await supabase.from("ai_usage_logs").insert({
      user_id: user.id,
      feature: "ai_teacher",
      tokens_used: response.usage.input_tokens + response.usage.output_tokens,
    });

    return NextResponse.json({ reply, conversationId: convoId });
  } catch (err) {
    console.error("AI Teacher error:", err);
    return NextResponse.json({ error: "The AI teacher is unavailable right now." }, { status: 500 });
  }
}
