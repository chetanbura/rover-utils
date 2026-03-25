export type WorkflowId =
  | "subgraph-publish"
  | "prod-publish-js"
  | "lle-publish-js"
  | "convert-manifest";

export type WorkflowMeta = {
  id: WorkflowId;
  label: string;
  path: string;
  description: string;
};

export const WORKFLOWS: WorkflowMeta[] = [
  {
    id: "subgraph-publish",
    label: "Schema Publish",
    path: "/workflows/subgraph-publish",
    description: "Publish a subgraph schema using Rover.",
  },
  {
    id: "prod-publish-js",
    label: "Safelisting Prod Publish",
    path: "/workflows/prod-publish",
    description:
      "Publish persisted query manifest to all production variants.",
  },
  {
    id: "lle-publish-js",
    label: "Safelisting LLE Publish",
    path: "/workflows/lle-publish",
    description: "Publish persisted query manifest to uxl-perf@default.",
  },
  {
    id: "convert-manifest",
    label: "Manifest Convert v2 -> v1",
    path: "/workflows/convert-manifest",
    description: "Convert a v2 manifest to Apollo v1 persisted query format.",
  },
];

export const DEFAULT_WORKFLOW_PATH = WORKFLOWS[0].path;
