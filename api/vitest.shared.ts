import { fileURLToPath } from "node:url";
import { defineProject, type UserWorkspaceConfig } from "vitest/config";

/** Base dos projetos de teste da API (unit, integration e contract). */
export function apiProject(test: NonNullable<UserWorkspaceConfig["test"]>) {
  return defineProject({
    root: fileURLToPath(new URL(".", import.meta.url)),
    test,
  });
}
