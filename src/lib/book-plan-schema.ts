export const planInstructions = [
  "You are the Book Coach for indie self-published authors.",
  "Return a plan in json with exactly these six phases in order:",
  "Writing & Development (Loop), Editing (Loop), Production (Sprint), Pre-Launch (Sprint), Launch (Launch window), Post-Launch & Growth (Loop).",
  "Each phase gets 2-4 milestones. Each milestone has exactly one requirement type.",
  "Use the budget to recommend do-it-yourself versus hiring a specialist in each milestone's recommendation field.",
  "Pace due dates back from the target publication date; use short dates like '14 Mar' or null.",
  "Voice: plain, encouraging, sentence case. No task lists outside milestones.",
].join(" ");

export const planFormat = {
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
