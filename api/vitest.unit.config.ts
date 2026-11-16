import { apiProject } from "./vitest.shared.js";

export default apiProject({
  name: "unit",
  include: ["tests/unit/**/*.test.ts"],
});
