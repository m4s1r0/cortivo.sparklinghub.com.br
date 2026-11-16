import { defineConfig } from "vitest/config";

// Raiz que agrega os projetos; sem ela `vitest run --project unit` não os descobre.
export default defineConfig({
  test: {
    projects: ["vitest.unit.config.ts", "vitest.integration.config.ts", "vitest.contract.config.ts"],
    // Camada ainda sem testes não deve quebrar a execução.
    passWithNoTests: true,
  },
});
