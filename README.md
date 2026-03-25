# Rover Commands UI

This project provides a Next.js web UI to run local Rover workflows in this workspace.

## What It Supports

- Schema publishing via `schema-publish/publish-subgraph.js`
- Safelisting publish (prod) via:
  - `safelisting/publish/prod-publish-manifest.js`
- Safelisting publish (LLE/perf) via:
  - `safelisting/publish/lle-publish-manifest.js`
- Manifest conversion via `safelisting/convert-manifest/convert-manifest.js`

## UI Structure

- Top header with workflow dropdown menu
- Independent route per workflow, each with a dedicated form UI:
  - `/workflows/subgraph-publish`
  - `/workflows/prod-publish`
  - `/workflows/lle-publish`
  - `/workflows/convert-manifest`

## How To Run

From the project directory `rover-utils`:

```bash
cd rover-utils
pnpm install
pnpm dev
```

Or from the parent directory:

```bash
pnpm --dir rover-utils install
pnpm --dir rover-utils dev
```

Then open [http://localhost:3000](http://localhost:3000).

Useful commands:

```bash
pnpm lint
pnpm build
```

## UI Workflows And Inputs

### 1) Schema Publish (Node)

Required:
- `subgraphName`
- `schemaFilePath`
- `routingUrl`
- `graphRef`

Optional:
- `uploadedSchema` (if uploaded, it is used first)
- `authProfile`
- `apolloKey` (sent as `APOLLO_KEY` env var for that execution)

### 2) Safelisting Prod Publish (Node)

Required:
- `manifestFilePath`

Optional:
- `uploadedManifest` (if uploaded, it is used first)
- `roverProfile` (defaults to `prod-profile` in script)
- `apolloKey` (sent as `APOLLO_KEY` env var for that execution)

Targets are fixed by script:
- `UXL-Production@prod-17-default`
- `UXL-Production@prod-13-default`
- `UXL-Production@prod-16-default`

### 3) Safelisting LLE Publish (Node)

Required:
- `manifestFilePath`

Optional:
- `uploadedManifest` (if uploaded, it is used first)
- `roverProfile`
- `apolloKey` (sent as `APOLLO_KEY` env var for that execution)

Target is fixed by script:
- `uxl-perf@default`

### 4) Manifest Convert v2 -> v1

Required:
- `inputManifestPath`

Optional:
- `uploadedManifest` (if uploaded, it is used first)
- `outputManifestPath` (defaults to `manifest.v1.json` if omitted)

## API Endpoint

- Route: `POST /api/execute`
- Accepts workflow-specific JSON payload
- Returns:
  - `command`
  - `stdout`
  - `stderr`
  - `exitCode`
  - `durationMs`

## Safety Notes

- The API only executes a fixed set of known scripts.
- Path-based inputs are validated to stay inside this workspace.
- Manifest/input files are checked for existence before command execution.

