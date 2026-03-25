import styles from "./workflow-form.module.css";
import { RunResult } from "./useWorkflowExecution";

type Props = {
  result: RunResult;
};

export function ExecutionResult({ result }: Props) {
  return (
    <section className={styles.outputSection}>
      <h2>Execution Result</h2>
      <p>
        <strong>Workflow:</strong> {result.workflowId}
      </p>
      <p>
        <strong>Exit Code:</strong> {result.exitCode}
      </p>
      <p>
        <strong>Duration:</strong> {result.durationMs} ms
      </p>
      <p>
        <strong>Command:</strong> <code>{result.command}</code>
      </p>

      <h3>stdout</h3>
      <pre className={styles.output}>{result.stdout || "(empty)"}</pre>

      <h3>stderr</h3>
      <pre className={styles.output}>{result.stderr || "(empty)"}</pre>
    </section>
  );
}
