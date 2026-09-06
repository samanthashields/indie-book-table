import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { authenticateRequest, buildPenContext, penInstructions } from "@/lib/pen.server";

type PenRequestBody = { messages?: unknown; threadId?: unknown; section?: unknown };

function textOf(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

export const Route = createFileRoute("/api/pen")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("Pen is not configured for this app yet.", { status: 500 });

        const auth = await authenticateRequest(request);
        if (!auth) return new Response("Please sign in to talk to Pen.", { status: 401 });
        const { supabase, userId } = auth;

        const body = (await request.json()) as PenRequestBody;
        const messages = Array.isArray(body.messages) ? (body.messages as UIMessage[]) : null;
        if (!messages) return new Response("Messages are required", { status: 400 });
        const threadId = typeof body.threadId === "string" ? body.threadId : null;
        const section = typeof body.section === "string" ? body.section : null;

        const { data: profile } = await supabase
          .from("profiles")
          .select("plan")
          .eq("user_id", userId)
          .maybeSingle();
        if (profile?.plan !== "paid") {
          return new Response("Pen comes with the paid plan.", { status: 403 });
        }

        if (threadId) {
          const { data: thread } = await supabase
            .from("pen_threads")
            .select("id")
            .eq("id", threadId)
            .maybeSingle();
          if (!thread) return new Response("Conversation not found.", { status: 404 });
        }

        const context = await buildPenContext(supabase, userId);
        const openai = createOpenAI({
          apiKey,
          baseURL: "https://ai.gateway.lovable.dev/v1",
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
        });

        const result = streamText({
          model: openai("openai/gpt-5.4-mini"),
          system: [
            penInstructions,
            `Where the author is right now in the app: ${section ?? "the workshop"}.`,
            "The author's current context:",
            context,
          ].join("\n\n"),
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onFinish: async ({ responseMessage }) => {
            if (!threadId) return;
            const lastUser = [...messages].reverse().find((message) => message.role === "user");
            const rows: { thread_id: string; role: string; content: string }[] = [];
            if (lastUser) rows.push({ thread_id: threadId, role: "user", content: textOf(lastUser) });
            const reply = textOf(responseMessage);
            if (reply) rows.push({ thread_id: threadId, role: "assistant", content: reply });
            if (rows.length === 0) return;
            const { error } = await supabase.from("pen_messages").insert(rows);
            if (error) console.error("[pen] failed to save messages", error.message);
            await supabase
              .from("pen_threads")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", threadId);
          },
        });
      },
    },
  },
});
