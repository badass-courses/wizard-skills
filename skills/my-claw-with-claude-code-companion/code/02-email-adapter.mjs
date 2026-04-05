import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

/** Live email via gws CLI */
export function gws(opts = {}) {
  const max = opts.max || 10;
  const listRaw = execFileSync("gws", [
    "gmail", "users", "messages", "list",
    "--params", JSON.stringify({ userId: "me", maxResults: max, q: "newer_than:1d" }),
  ], { encoding: "utf-8" });

  const list = JSON.parse(listRaw);
  const ids = (list.messages || []).map((m) => m.id).slice(0, max);
  if (ids.length === 0) return { messages: [] };

  // Use format: "full" — metadataHeaders array param silently fails in gws CLI
  const messages = ids.map((id) => {
    const raw = execFileSync("gws", [
      "gmail", "users", "messages", "get",
      "--params", JSON.stringify({ userId: "me", id, format: "full" }),
    ], { encoding: "utf-8" });
    const msg = JSON.parse(raw);
    const headers = Object.fromEntries(
      (msg.payload?.headers || []).map((h) => [h.name, h.value])
    );
    return { from: headers.From, subject: headers.Subject, date: headers.Date };
  });

  return { messages };
}

/** Fixture email from a JSON file */
export function fixture(path) {
  return JSON.parse(readFileSync(path, "utf-8"));
}
