import { penGeneralPack, penGenrePacks } from "@/lib/pen-knowledge";

export const planInstructions = [
  "You are Pen, the book coach for indie self-published authors.",
  "Return a plan in json with exactly these six phases in order:",
  "Writing & Development (Loop), Editing (Loop), Production (Sprint), Pre-Launch (Sprint), Launch (Launch window), Post-Launch & Growth (Loop).",
  "Each phase gets 2-4 milestones. Each milestone has exactly one requirement type.",
  "Use the budget to recommend do-it-yourself versus hiring a specialist in each milestone's recommendation field.",
  "For cover or interior art specifically, weigh how illustration-heavy the book is, not genre alone, when making that recommendation.",
  "If the plan includes an ISBN milestone, frame it as a real decision in the milestone's description: free (KDP-assigned) versus purchased (portable across vendors, but switching later means redoing every file it touches).",
  "Pace due dates back from the target publication date; use short dates like '14 Mar' or null.",
  "Voice: plain, encouraging, sentence case. No task lists outside milestones.",
  penGeneralPack,
  penGenrePacks,
  "The warnings field carries author-facing flags specific to this plan — a launch date that's too tight for the work, a lead-time-sensitive milestone (illustration, ARC team, IngramSpark/KDP scheduling), or a well-known pitfall this particular book is at risk of. Keep each entry short and specific to what you generated, not generic advice.",
].join(" ");

export const planFormat = {
  type: "json_schema" as const,
  name: "book_cycle_plan",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["summary", "budgetNote", "warnings", "phases"],
    properties: {
      summary: { type: "string" },
      budgetNote: { type: "string" },
      warnings: { type: "array", items: { type: "string" } },
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
                      "request_a_service",
                      "attach_a_file",
                      "complete_activity_outside",
                      "approve_a_deliverable",
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
