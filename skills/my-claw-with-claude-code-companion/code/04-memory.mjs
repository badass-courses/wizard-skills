import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOG_FILE = join(__dirname, ".claw", "interactions.jsonl");
const MEMORY_FILE = join(__dirname, ".claw", "MEMORY.md");
const LAST_ANALYSIS_FILE = join(__dirname, ".claw", "memory-last-analysis");

const MIN_NEW_INTERACTIONS = 3;

export async function analyze() {
  if (!existsSync(LOG_FILE)) return false;

  // Read interactions since last analysis
  const lastAnalysis = existsSync(LAST_ANALYSIS_FILE)
    ? parseInt(readFileSync(LAST_ANALYSIS_FILE, "utf-8").trim(), 10)
    : 0;

  const lines = readFileSync(LOG_FILE, "utf-8").trim().split("\n");
  const recent = lines
    .map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(e => e && e.timestamp > lastAnalysis);

  if (recent.length < MIN_NEW_INTERACTIONS) return false;

  // Read existing memories
  const currentMemory = existsSync(MEMORY_FILE)
    ? readFileSync(MEMORY_FILE, "utf-8")
    : "No memories yet.";

  const prompt = `You are a memory analyst for a personal AI familiar. Analyze the recent interactions below and update the operator's memory file.

## Current Memory
${currentMemory}

## Recent Interactions (${recent.length} new)
${recent.map(e => `[${new Date(e.timestamp).toISOString()}] ${e.chatId}\nQ: ${e.prompt}\nA: ${e.response}`).join("\n\n")}

## Instructions
Produce an updated MEMORY.md with these sections:
- **Operator Preferences** — communication style, working hours, response format
- **VIPs** — people mentioned frequently, their relationship, relevant context
- **Active Projects** — what they're working on, deadlines, concerns
- **Standing Orders** — things the claw should always do
- **Patterns** — recurring requests, workflows, behavioral observations

Keep it concise. Remove stale entries. Update existing entries with new information. Only add things that will be useful across future sessions.

Output ONLY the markdown content for MEMORY.md. No preamble.`;

  const args = ["-p", prompt, "--output-format", "json", "--model", "sonnet", "--no-input"];
  const raw = execFileSync("claude", args, {
    cwd: __dirname,
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 60000,
  });

  const result = JSON.parse(raw);
  writeFileSync(MEMORY_FILE, result.result);
  writeFileSync(LAST_ANALYSIS_FILE, String(Date.now()));

  return true;
}
