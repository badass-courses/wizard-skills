import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

/** Live calendar via gws CLI */
export function gws(opts = {}) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start.getTime() + (opts.days || 1) * 24 * 60 * 60 * 1000);

  const raw = execFileSync("gws", [
    "calendar", "events", "list",
    "--params", JSON.stringify({
      calendarId: "primary",
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    }),
  ], { encoding: "utf-8" });

  const data = JSON.parse(raw);
  const events = (data.items || []).map((e) => ({
    summary: e.summary,
    start: e.start?.dateTime || e.start?.date,
    end: e.end?.dateTime || e.end?.date,
  }));

  return { events };
}

/** Fixture calendar from a JSON file */
export function fixture(path) {
  return JSON.parse(readFileSync(path, "utf-8"));
}
