import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { planFormat, planInstructions } from "@/lib/book-plan-schema";

const intakeSchema = z.object({
  premise: z.string().min(1).max(2000),
  genre: z.string().min(1).max(200),
  stage: z.string().max(500).default(""),
  goals: z.string().max(2000).default(""),
  targetDate: z.string().max(40).default(""),
  budget: z.number().min(0).max(1000000),
});

export const Route = createFileRoute("/api/coach-plan")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("AI is not configured for this app yet.", { status: 500 });

        let data: z.infer<typeof intakeSchema>;
        try {
          data = intakeSchema.parse(await request.json());
        } catch {
          return new Response("Please fill in the premise, genre, and budget.", { status: 400 });
        }

        const input = [
          `Book premise: ${data.premise}`,
          `Genre or category: ${data.genre}`,
          `Manuscript stage: ${data.stage || "not stated"}`,
          `What matters most: ${data.goals || "not stated"}`,
          `Target publication date: ${data.targetDate || "not stated"}`,
          `Total budget: ${data.budget} USD`,
        ].join("\n");

        let upstream: Response;
        try {
          upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Lovable-API-Key": apiKey,
              "X-Lovable-AIG-SDK": "fetch",
            },
            signal: request.signal,
            body: JSON.stringify({
              model: "openai/gpt-5.4-mini",
              instructions: planInstructions,
              input,
              stream: true,
              store: false,
              text: { format: planFormat },
            }),
          });
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") return new Response(null, { status: 499 });
          throw error;
        }

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          const message =
            upstream.status === 429
              ? "The coach is busy right now. Try again in a moment."
              : detail || "The coach could not draft a plan.";
          return new Response(message, { status: upstream.status });
        }

        const reader = upstream.body.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";

        const stream = new ReadableStream<Uint8Array>({
          async pull(controller) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                controller.close();
                return;
              }
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() ?? "";
              let out = "";
              for (const line of lines) {
                if (!line.startsWith("data:")) continue;
                const payload = line.slice(5).trim();
                if (!payload || payload === "[DONE]") continue;
                try {
                  const event = JSON.parse(payload) as { type?: string; delta?: string };
                  if (event.type === "response.output_text.delta" && typeof event.delta === "string") out += event.delta;
                } catch {
                  // keep-alive or partial frame
                }
              }
              if (out) {
                controller.enqueue(encoder.encode(out));
                return;
              }
            }
          },
          cancel() {
            void reader.cancel();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
            "X-Accel-Buffering": "no",
          },
        });
      },
    },
  },
});
