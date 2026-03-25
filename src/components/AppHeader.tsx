"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DEFAULT_WORKFLOW_PATH, WORKFLOWS } from "@/lib/workflows";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const selectedPath =
    WORKFLOWS.find((workflow) => pathname.startsWith(workflow.path))?.path ??
    DEFAULT_WORKFLOW_PATH;

  return (
    <header className="top-header">
      <div className="top-header__inner">
        <Link href="/" className="top-header__brand">
          Rover Commands UI
        </Link>

        <nav className="top-header__nav">
          <label htmlFor="workflow-menu" className="top-header__label">
            Workflows
          </label>
          <select
            id="workflow-menu"
            className="top-header__select"
            value={selectedPath}
            onChange={(event) => router.push(event.target.value)}
          >
            {WORKFLOWS.map((workflow) => (
              <option key={workflow.id} value={workflow.path}>
                {workflow.label}
              </option>
            ))}
          </select>
        </nav>
      </div>
    </header>
  );
}
