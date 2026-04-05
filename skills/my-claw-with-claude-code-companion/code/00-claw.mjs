#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const SESSION_FILE = ".claw-session";
const prompt = process.argv.slice(2).join(" ");

if (!prompt) {
  console.log("Usage: node claw.mjs <prompt>");
  process.exit(0);
}

// Build command args. execFileSync passes args directly, no shell quoting issues
const args = ["-p", prompt, "--output-format", "json"];

// Resume session if one exists
const sessionId = existsSync(SESSION_FILE)
  ? readFileSync(SESSION_FILE, "utf-8").trim()
  : null;
if (sessionId) {
  args.push("--resume", sessionId);
}

try {
  const raw = execFileSync("claude", args, {
    cwd: import.meta.dirname,
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  });

  const result = JSON.parse(raw);

  if (result.is_error) {
    console.error("Error:", result.result);
    process.exit(1);
  }

  // Save session for next time
  if (result.session_id) {
    writeFileSync(SESSION_FILE, result.session_id);
  }

  console.log(result.result);

  // Metadata when VERBOSE is set
  if (process.env.VERBOSE) {
    console.log("\n---");
    console.log(`Session: ${result.session_id}`);
    console.log(`Cost: $${result.total_cost_usd?.toFixed(4) ?? "?"}`);
    console.log(`Turns: ${result.num_turns}`);
    console.log(`Duration: ${(result.duration_ms / 1000).toFixed(1)}s`);
  }
} catch (err) {
  console.error("Failed:", err.message);
  process.exit(1);
}
