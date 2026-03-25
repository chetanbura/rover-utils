import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { NextResponse } from "next/server";

type WorkflowId =
  | "subgraph-publish"
  | "prod-publish-js"
  | "lle-publish-js"
  | "convert-manifest";

type ExecuteRequest = {
  workflowId: WorkflowId;
  subgraphName?: string;
  schemaFilePath?: string;
  routingUrl?: string;
  authProfile?: string;
  apolloKey?: string;
  graphRef?: string;
  uploadedSchemaContent?: string;
  uploadedSchemaName?: string;
  manifestFilePath?: string;
  roverProfile?: string;
  uploadedManifestContent?: string;
  uploadedManifestName?: string;
  inputManifestPath?: string;
  outputManifestPath?: string;
};

type CommandSpec = {
  command: string;
  args: string[];
  envOverrides?: Record<string, string>;
};

const workspaceRoot = path.resolve(process.cwd(), "..");

function resolveInputPath(filePath: string): string {
  const normalized = filePath.trim();
  return path.isAbsolute(normalized)
    ? normalized
    : path.resolve(workspaceRoot, normalized);
}

function assertFileExists(filePath: string): string {
  const absolutePath = resolveInputPath(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return absolutePath;
}

function buildCommand(body: ExecuteRequest): CommandSpec {
  const { workflowId } = body;

  if (!workflowId) {
    throw new Error("workflowId is required.");
  }

  switch (workflowId) {
    case "subgraph-publish": {
      if (!body.subgraphName || !body.schemaFilePath || !body.routingUrl || !body.graphRef) {
        throw new Error(
          "subgraphName, schemaFilePath, routingUrl, and graphRef are required.",
        );
      }

      const scriptPath = path.join(workspaceRoot, "schema-publish/publish-subgraph.js");
      assertFileExists(body.schemaFilePath);
      const envOverrides: Record<string, string> = {};
      if (body.apolloKey?.trim()) {
        envOverrides.APOLLO_KEY = body.apolloKey.trim();
      }

      return {
        command: "node",
        args: [
          scriptPath,
          "--subgraphName",
          body.subgraphName,
          "--schemaFilePath",
          body.schemaFilePath,
          "--routingUrl",
          body.routingUrl,
          "--graphRef",
          body.graphRef,
          ...(body.authProfile ? ["--authProfile", body.authProfile] : []),
        ],
        envOverrides,
      };
    }

    case "prod-publish-js": {
      if (!body.manifestFilePath) {
        throw new Error("manifestFilePath is required.");
      }

      const scriptPath = path.join(workspaceRoot, "safelisting/publish/prod-publish-manifest.js");
      const manifestPath = assertFileExists(body.manifestFilePath);
      const envOverrides: Record<string, string> = {};
      if (body.apolloKey?.trim()) {
        envOverrides.APOLLO_KEY = body.apolloKey.trim();
      }

      return {
        command: "node",
        args: [
          scriptPath,
          manifestPath,
          ...(body.roverProfile?.trim()
            ? ["--profile", body.roverProfile.trim()]
            : []),
        ],
        envOverrides,
      };
    }

    case "lle-publish-js": {
      if (!body.manifestFilePath) {
        throw new Error("manifestFilePath is required.");
      }

      const scriptPath = path.join(workspaceRoot, "safelisting/publish/lle-publish-manifest.js");
      const manifestPath = assertFileExists(body.manifestFilePath);
      const envOverrides: Record<string, string> = {};
      if (body.apolloKey?.trim()) {
        envOverrides.APOLLO_KEY = body.apolloKey.trim();
      }

      return {
        command: "node",
        args: [
          scriptPath,
          manifestPath,
          ...(body.roverProfile?.trim()
            ? ["--profile", body.roverProfile.trim()]
            : []),
        ],
        envOverrides,
      };
    }

    case "convert-manifest": {
      if (!body.inputManifestPath) {
        throw new Error("inputManifestPath is required.");
      }

      const scriptPath = path.join(workspaceRoot, "safelisting/convert-manifest/convert-manifest.js");
      const inputManifestPath = assertFileExists(body.inputManifestPath);
      const outputManifestPath = body.outputManifestPath?.trim()
        ? resolveInputPath(body.outputManifestPath)
        : path.resolve(workspaceRoot, "manifest.v1.json");

      return { command: "node", args: [scriptPath, inputManifestPath, outputManifestPath] };
    }

    default:
      throw new Error(`Unsupported workflow: ${workflowId}`);
  }
}

function runCommand(commandSpec: CommandSpec): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
}> {
  return new Promise((resolve, reject) => {
    const child = spawn(commandSpec.command, commandSpec.args, {
      cwd: workspaceRoot,
      env: {
        ...process.env,
        ...(commandSpec.envOverrides ?? {}),
      },
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      resolve({
        stdout,
        stderr,
        exitCode: code ?? 1,
      });
    });
  });
}

export async function POST(request: Request) {
  let tempDirPath: string | undefined;

  try {
    const body = (await request.json()) as ExecuteRequest;

    if (body.workflowId === "subgraph-publish" && body.uploadedSchemaContent) {
      tempDirPath = fs.mkdtempSync(path.join(os.tmpdir(), "rover-ui-schema-"));
      const safeFileName = (body.uploadedSchemaName || "uploaded-schema.graphql")
        .replace(/[^\w.-]/g, "_")
        .slice(0, 120);
      const uploadedPath = path.join(tempDirPath, safeFileName || "uploaded-schema.graphql");
      fs.writeFileSync(uploadedPath, body.uploadedSchemaContent, "utf8");
      body.schemaFilePath = uploadedPath;
    }

    if (body.uploadedManifestContent) {
      tempDirPath = fs.mkdtempSync(path.join(os.tmpdir(), "rover-ui-manifest-"));
      const safeFileName = (body.uploadedManifestName || "uploaded-manifest.json")
        .replace(/[^\w.-]/g, "_")
        .slice(0, 120);
      const uploadedPath = path.join(tempDirPath, safeFileName || "uploaded-manifest.json");
      fs.writeFileSync(uploadedPath, body.uploadedManifestContent, "utf8");

      if (body.workflowId === "convert-manifest") {
        body.inputManifestPath = uploadedPath;
      } else if (
        body.workflowId === "prod-publish-js" ||
        body.workflowId === "lle-publish-js"
      ) {
        body.manifestFilePath = uploadedPath;
      }
    }

    const commandSpec = buildCommand(body);

    const start = Date.now();
    const execution = await runCommand(commandSpec);
    const durationMs = Date.now() - start;

    return NextResponse.json({
      workflowId: body.workflowId,
      command: `${commandSpec.command} ${commandSpec.args
        .map((arg) => (arg.includes(" ") ? `"${arg}"` : arg))
        .join(" ")}`,
      durationMs,
      ...execution,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected server error.",
      },
      { status: 400 },
    );
  } finally {
    if (tempDirPath && fs.existsSync(tempDirPath)) {
      fs.rmSync(tempDirPath, { recursive: true, force: true });
    }
  }
}

