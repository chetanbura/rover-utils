"use client";

import { FormEvent, useState } from "react";
import styles from "./workflow-form.module.css";
import { ExecutionResult } from "./ExecutionResult";
import { useWorkflowExecution } from "./useWorkflowExecution";

export function ConvertManifestForm() {
  const [inputManifestUpload, setInputManifestUpload] = useState<File | null>(null);
  const [inputManifestPath, setInputManifestPath] = useState(
    "safelisting/manifest/manifest.json",
  );
  const [outputManifestPath, setOutputManifestPath] = useState("manifest.v1.json");
  const { isSubmitting, error, result, run } =
    useWorkflowExecution("convert-manifest");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const uploadedManifestContent = inputManifestUpload
      ? await inputManifestUpload.text()
      : undefined;

    await run({
      uploadedManifestContent,
      uploadedManifestName: inputManifestUpload?.name,
      inputManifestPath: inputManifestPath.trim(),
      outputManifestPath: outputManifestPath.trim(),
    });
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Manifest Convert v2 -&gt; v1</h1>
      <p className={styles.subtitle}>
        Convert a v2 persisted-query manifest to Apollo v1 format used by Rover.
      </p>
      <p className={styles.info}>
        Input manifest source priority: uploaded file first, then Input Manifest
        path.
      </p>

      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.label}>
          Upload Input Manifest (Optional)
          <input
            className={styles.input}
            type="file"
            accept=".json,application/json"
            onChange={(event) =>
              setInputManifestUpload(event.target.files?.[0] ?? null)
            }
          />
        </label>

        <label className={styles.label}>
          Input Manifest (v2)
          <input
            className={styles.input}
            value={inputManifestPath}
            onChange={(event) => setInputManifestPath(event.target.value)}
            placeholder="safelisting/manifest/manifest.json"
            required
          />
        </label>

        <label className={styles.label}>
          Output Manifest (v1)
          <input
            className={styles.input}
            value={outputManifestPath}
            onChange={(event) => setOutputManifestPath(event.target.value)}
            placeholder="manifest.v1.json"
          />
        </label>

        <button className={styles.button} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Running..." : "Run Workflow"}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}
      {result && <ExecutionResult result={result} />}
    </div>
  );
}
