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
