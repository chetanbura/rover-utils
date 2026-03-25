"use client";

import { FormEvent, useState } from "react";
import styles from "./workflow-form.module.css";
import { ExecutionResult } from "./ExecutionResult";
import { useWorkflowExecution } from "./useWorkflowExecution";

export function ProdPublishForm() {
  const [manifestFilePath, setManifestFilePath] = useState(
    "safelisting/manifest/manifest.json",
  );
  const [manifestUpload, setManifestUpload] = useState<File | null>(null);
  const [roverProfile, setRoverProfile] = useState("prod-profile");
  const [apolloKey, setApolloKey] = useState("");
  const { isSubmitting, error, result, run } =
    useWorkflowExecution("prod-publish-js");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const uploadedManifestContent = manifestUpload
      ? await manifestUpload.text()
      : undefined;

    await run({
      manifestFilePath: manifestFilePath.trim(),
      roverProfile: roverProfile.trim(),
      apolloKey: apolloKey.trim(),
      uploadedManifestContent,
      uploadedManifestName: manifestUpload?.name,
    });
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Safelisting Prod Publish</h1>
      <p className={styles.subtitle}>
        Publish manifest to production variants via Node.js workflow.
      </p>

      <p className={styles.info}>
        Targets: UXL-Production@prod-17-default, UXL-Production@prod-13-default,
        UXL-Production@prod-16-default
      </p>
      <p className={styles.info}>
        Manifest source priority: uploaded file first, then Manifest File Path.
      </p>

      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.label}>
          Upload Manifest File (Optional)
          <input
            className={styles.input}
            type="file"
            accept=".json,application/json"
            onChange={(event) => setManifestUpload(event.target.files?.[0] ?? null)}
          />
        </label>

        <label className={styles.label}>
          Manifest File Path
          <input
            className={styles.input}
            value={manifestFilePath}
            onChange={(event) => setManifestFilePath(event.target.value)}
            placeholder="safelisting/manifest/manifest.json"
            required
          />
        </label>

        <label className={styles.label}>
          Rover Profile (Optional)
          <input
            className={styles.input}
            value={roverProfile}
            onChange={(event) => setRoverProfile(event.target.value)}
            placeholder="prod-profile"
          />
        </label>

        <label className={styles.label}>
          APOLLO_KEY (Optional)
          <input
            className={styles.input}
            type="password"
            value={apolloKey}
            onChange={(event) => setApolloKey(event.target.value)}
            placeholder="service:graph-id:REDACTED_KEY_VALUE"
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
