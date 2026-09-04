import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const intakeSchema = z.object({
  premise: z.string().min(1).max(2000),
  genre: z.string().min(1).max(200),
  stage: z.string().max(500).default(""),
  goals: z.string().max(2000).default(""),
  targetDate: z.string().max(40).default(""),
  budget: z.number().min(0).max(1000000),
});

export type GeneratedMilestone = {
  name: string;
  description: string;
  requirement:
    | "Request a Service"
    | "Attach a File"
    | "Complete an Activity Outside the Platform"
    | "Approve a Deliverable";
  recommendation: string;
  approvalRequired: boolean;
  due: string | null;
};

export type GeneratedPhase = {
  name: string;
  mode: "Loop" | "Sprint" | "Launch window";
  summary: string;
  milestones: GeneratedMilestone[];
};

export type GeneratedPlan = {
  summary: string;
  budgetNote: string;
  pitfalls: string[];
  phases: GeneratedPhase[];
};

const planFormat = {
  type: "json_schema" as const,
  name: "book_cycle_plan",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["summary", "budgetNote", "pitfalls", "phases"],
    properties: {
      summary: { type: "string" },
      budgetNote: { type: "string" },
      pitfalls: { type: "array", items: { type: "string" } },
      phases: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "mode", "summary", "milestones"],
          properties: {
            name: { type: "string" },
            mode: { type: "string", enum: ["Loop", "Sprint", "Launch window"] },
            summary: { type: "string" },
            milestones: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["name", "description", "requirement", "recommendation", "approvalRequired", "due"],
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  requirement: {
                    type: "string",
                    enum: [
                      "Request a Service",
                      "Attach a File",
                      "Complete an Activity Outside the Platform",
                      "Approve a Deliverable",
                    ],
                  },
                  recommendation: { type: "string" },
                  approvalRequired: { type: "boolean" },
                  due: { type: ["string", "null"] },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const generateBookPlan = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => intakeSchema.parse(data))
  .handler(async ({ data }): Promise<GeneratedPlan> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this app yet.");

    const instructions = [
      "You are the Book Coach for indie self-published authors.",
      "Return a plan in json with exactly these six phases in order:",
      "Writing & Development (Loop), Editing (Loop), Production (Sprint), Pre-Launch (Sprint), Launch (Launch window), Post-Launch & Growth (Loop).",
      "Each phase gets 2-4 milestones. Each milestone has exactly one requirement type.",
      "Use the budget to recommend do-it-yourself versus hiring a specialist in each milestone's recommendation field.",
      "Pace due dates back from the target publication date; use short dates like '14 Mar' or null.",
      "Voice: plain, encouraging, sentence case. No task lists outside milestones.",
    ].join(" ");

    const input = [
      `Book premise: ${data.premise}`,
      `Genre or category: ${data.genre}`,
      `Manuscript stage: ${data.stage || "not stated"}`,
      `What matters most: ${data.goals || "not stated"}`,
      `Target publication date: ${data.targetDate || "not stated"}`,
      `Total budget: ${data.budget} USD`,
    ].join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.4-mini",
        instructions,
        input,
        stream: true,
        store: false,
        text: { format: planFormat },
      }),
    });

    if (!response.ok || !response.body) {
      const detail = await response.text().catch(() => "");
      if (response.status === 429) throw new Error("The coach is busy right now. Try again in a moment.");
      if (response.status === 402 || response.status === 403)
        throw new Error(detail || "AI credits are unavailable for this workspace.");
      throw new Error(detail || "The coach could not draft a plan.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const event = JSON.parse(payload) as { type?: string; delta?: string; response?: { output_text?: string } };
          if (event.type === "response.output_text.delta" && typeof event.delta === "string") text += event.delta;
          else if (event.type === "response.completed" && typeof event.response?.output_text === "string" && !text)
            text = event.response.output_text;
        } catch {
          // ignore keep-alive or partial frames
        }
      }
    }

    if (!text.trim()) throw new Error("The coach returned an empty plan. Try again.");
    return JSON.parse(text) as GeneratedPlan;
  });
