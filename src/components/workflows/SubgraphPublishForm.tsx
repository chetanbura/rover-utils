"use client";

import { FormEvent, useState } from "react";
import styles from "./workflow-form.module.css";
import { ExecutionResult } from "./ExecutionResult";
import { useWorkflowExecution } from "./useWorkflowExecution";

export function SubgraphPublishForm() {
  const [subgraphName, setSubgraphName] = useState("");
  const [schemaUpload, setSchemaUpload] = useState<File | null>(null);
  const [schemaFilePath, setSchemaFilePath] = useState(
    "schema-publish/schema/schema.graphql",
  );
  const [routingUrl, setRoutingUrl] = useState("http://localhost:4001/graphql");
  const [authProfile, setAuthProfile] = useState("");
  const [graphRef, setGraphRef] = useState("MySupergraph@dev");
  const [apolloKey, setApolloKey] = useState("");

  const { isSubmitting, error, result, run } =
    useWorkflowExecution("subgraph-publish");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const uploadedSchemaContent = schemaUpload ? await schemaUpload.text() : undefined;

    await run({
      subgraphName: subgraphName.trim(),
      uploadedSchemaContent,
      uploadedSchemaName: schemaUpload?.name,
      schemaFilePath: schemaFilePath.trim(),
      routingUrl: routingUrl.trim(),
      graphRef: graphRef.trim(),
      authProfile: authProfile.trim(),
      apolloKey: apolloKey.trim(),
    });
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Schema Publish</h1>
      <p className={styles.subtitle}>
        Publish a subgraph schema with graph ref, routing URL, and optional auth
        profile or APOLLO_KEY.
      </p>
      <p className={styles.info}>
        Schema source priority: uploaded schema first, then Schema File Path.
      </p>

      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.label}>
          Subgraph Name
          <input
            className={styles.input}
            value={subgraphName}
            onChange={(event) => setSubgraphName(event.target.value)}
            placeholder="products"
            required
          />
        </label>

        <label className={styles.label}>
          Upload Schema File (Optional)
          <input
            className={styles.input}
            type="file"
            accept=".graphql,.gql,.txt,text/plain"
            onChange={(event) => setSchemaUpload(event.target.files?.[0] ?? null)}
          />
        </label>

        <label className={styles.label}>
          Schema File Path
          <input
            className={styles.input}
            value={schemaFilePath}
            onChange={(event) => setSchemaFilePath(event.target.value)}
            placeholder="schema-publish/schema/schema.graphql"
            required
          />
        </label>

        <label className={styles.label}>
          Routing URL
          <input
            className={styles.input}
            value={routingUrl}
            onChange={(event) => setRoutingUrl(event.target.value)}
            placeholder="http://localhost:4001/graphql"
            required
          />
        </label>

        <label className={styles.label}>
          Graph Ref
          <input
            className={styles.input}
            value={graphRef}
            onChange={(event) => setGraphRef(event.target.value)}
            placeholder="MySupergraph@dev"
            required
          />
        </label>

        <label className={styles.label}>
          Auth Profile (Optional)
          <input
            className={styles.input}
            value={authProfile}
            onChange={(event) => setAuthProfile(event.target.value)}
            placeholder="dev-profile"
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
