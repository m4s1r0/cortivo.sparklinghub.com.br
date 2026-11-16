import { apiProject } from "./vitest.shared.js";

// Contratos do Core (openapi 1.4.0 e 1.3.3) e deriva do artefato; CORE_REPO_DIR aponta o checkout do Core.
export default apiProject({
  name: "contract",
  include: ["tests/contract/**/*.test.ts"],
  testTimeout: 30_000,
});
