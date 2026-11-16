// Sobe API (3003) e Vite (5177) juntos para desenvolvimento local (ECO-002).
import { spawn } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const procs = [
  spawn(npm, ["run", "dev", "-w", "api"], { stdio: "inherit", shell: process.platform === "win32" }),
  spawn(npm, ["run", "dev", "-w", "web"], { stdio: "inherit", shell: process.platform === "win32" }),
];

let encerrando = false;
function encerrar(codigo) {
  if (encerrando) return;
  encerrando = true;
  for (const p of procs) p.kill();
  process.exit(codigo);
}

for (const p of procs) p.on("exit", (codigo) => encerrar(codigo ?? 1));
process.on("SIGINT", () => encerrar(0));
process.on("SIGTERM", () => encerrar(0));
