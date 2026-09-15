import type { RequirementType } from "@/lib/book-data";

export type GeneratedMilestone = {
  name: string;
  description: string;
  requirement: RequirementType;
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
