import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as emailAdapter from "./adapters/email.mjs";
import * as calendarAdapter from "./adapters/calendar.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, ".claw", "cache");
const DIGEST_FILE = join(CACHE_DIR, "digest.md");
const SESSION_FILE = join(__dirname, ".claw", "gather-session");

mkdirSync(CACHE_DIR, { recursive: true });

// Decide source: fixture files or live gws
const useFixture = process.argv.includes("--fixture");
const fixtureArgs = process.argv.slice(process.argv.indexOf("--fixture") + 1);

let emails, calendar;
if (useFixture && fixtureArgs.length >= 2) {
  emails = emailAdapter.fixture(fixtureArgs[0]);
  calendar = calendarAdapter.fixture(fixtureArgs[1]);
} else {
  emails = emailAdapter.gws();
  calendar = calendarAdapter.gws({ today: false });
}

// Read existing digest for delta awareness
const existingDigest = existsSync(DIGEST_FILE)
  ? readFileSync(DIGEST_FILE, "utf-8")
  : "No previous digest.";

const prompt = `You are a background data gatherer. Analyze the following raw data and produce a structured digest in markdown.

If a previous digest exists, focus on what CHANGED since then. Report deltas, not the full state.

## Previous Digest
${existingDigest}

## Raw Email Data
${JSON.stringify(emails, null, 2)}

## Raw Calendar Data
${JSON.stringify(calendar, null, 2)}

Write a concise digest with sections: Email Summary, Calendar Summary, Action Items. Use bullet points. Be brief.`;

// Build args for Haiku
const args = ["-p", prompt, "--output-format", "json", "--model", "haiku"];

const sessionId = existsSync(SESSION_FILE)
  ? readFileSync(SESSION_FILE, "utf-8").trim()
  : null;
if (sessionId) args.push("--resume", sessionId);

try {
  const raw = execFileSync("claude", args, {
    cwd: __dirname,
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  });

  const result = JSON.parse(raw);
  if (result.session_id) writeFileSync(SESSION_FILE, result.session_id);

  writeFileSync(DIGEST_FILE, result.result);
  console.log("Digest updated:", DIGEST_FILE);
  if (process.env.VERBOSE) {
    console.log(`Cost: $${result.total_cost_usd?.toFixed(4) ?? "?"}`);
  }
} catch (err) {
  console.error("Gather failed:", err.message);
  process.exit(1);
}
