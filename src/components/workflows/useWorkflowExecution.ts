"use client";

import { useState } from "react";
import { WorkflowId } from "@/lib/workflows";

export type RunResult = {
  workflowId: WorkflowId;
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
};

export function useWorkflowExecution(workflowId: WorkflowId) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);

  async function run(payload: Record<string, string | undefined>) {
    setError(null);
    setResult(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId, ...payload }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Execution failed.");
      }

      setResult(data as RunResult);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unknown error.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    isSubmitting,
    error,
    result,
    run,
  };
}
