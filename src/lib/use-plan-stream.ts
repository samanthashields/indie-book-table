import { useCallback, useRef, useState } from "react";
import { parsePartialJson } from "@/lib/partial-json";
import type { GeneratedPlan } from "@/lib/book-plan.functions";

export type PartialPlan = Partial<GeneratedPlan>;

export function usePlanStream() {
  const [plan, setPlan] = useState<PartialPlan | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canceled, setCanceled] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const start = useCallback(async (input: Record<string, unknown>) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setPlan(null);
    setError(null);
    setCanceled(false);
    setIsStreaming(true);
    try {
      const response = await fetch("/api/coach-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        throw new Error((await response.text().catch(() => "")) || "The coach could not draft a plan.");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        const partial = parsePartialJson<GeneratedPlan>(text);
        if (partial) setPlan(partial);
      }
      if (!text.trim()) throw new Error("The coach returned an empty plan. Try again.");
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") setCanceled(true);
      else setError(caught instanceof Error ? caught.message : "The coach could not draft a plan.");
    } finally {
      setIsStreaming(false);
      controllerRef.current = null;
    }
  }, []);

  return { plan, isStreaming, error, canceled, start, cancel };
}
