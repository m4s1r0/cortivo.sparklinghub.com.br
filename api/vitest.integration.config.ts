import { apiProject } from "./vitest.shared.js";

// Exige MySQL 8.4 real em TEST_MYSQL_URL (Princípio V): mock de banco não é evidência.
export default apiProject({
  name: "integration",
  include: ["tests/integration/**/*.test.ts"],
  // Os testes compartilham o servidor MySQL; executar arquivo a arquivo.
  fileParallelism: false,
  testTimeout: 60_000,
  hookTimeout: 60_000,
});
