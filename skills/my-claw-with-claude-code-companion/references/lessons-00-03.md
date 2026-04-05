# Lessons 00-03: TC1 (Make It Talk) + TC2 (Make It Useful)

## 00 -- The Substrate

**What they build:** `claw.mjs` that sends a prompt to `claude -p`, gets structured JSON back, and maintains session continuity via `--resume`.

**Key files:** `claw.mjs`, `CLAUDE.md`, `package.json`, `.gitignore`

**Gotchas:**
- `execFileSync` not `execSync`. Shell quoting destroys multi-line prompts.
- `--bare` skips OAuth. Subscription users need non-bare.
- `--output-format json` returns `result` (text) and optionally `structured_output`.

**Evaluation checks:**
- [ ] `node claw.mjs "What is 2+2?"` returns a response
- [ ] `VERBOSE=1 node claw.mjs "hello"` shows session ID, cost, turns
- [ ] Second invocation remembers the first (session continuity)

---

## 01 -- Your First Skill

**What they build:** A `gws` CLI skill that gives the claw access to Gmail and Google Calendar.

**Key files:** `skills/gws/SKILL.md`, `.claude/settings.json`

**Prerequisites:** `gws` CLI installed and authenticated (`gws auth setup`). Takes 10-15 minutes. Requires Google Cloud project + OAuth.

**Gotchas:**
- Fresh Claude Code has zero MCP servers. Gmail/Calendar are NOT stock.
- `--permission-mode acceptEdits` still blocks Bash. Need `.claude/settings.json` with `Bash(gws:*)`.
- `gws auth setup` can fail with `Error: invalid_grant` if consent screen not published.

**Evaluation checks:**
- [ ] `skills/gws/SKILL.md` exists with gmail and calendar commands
- [ ] `.claude/settings.json` allows `Bash(gws:*)`
- [ ] `node claw.mjs "What's on my calendar today?"` runs `gws` and returns real data

**Part-task practice:** This is the FIRST skill. Teach the pattern explicitly: a SKILL.md maps natural language to commands. The claw reads it and gains a capability.

---

## 02 -- Background Awareness

**What they build:** A background gatherer that pulls email/calendar via adapters, interprets with Haiku, caches a digest the claw reads.

**Key files:** `gather.mjs`, `adapters/email.mjs`, `adapters/calendar.mjs`, `.claw/cache/digest.md`, `skills/gather/SKILL.md`

**Gotchas:**
- Continued session (`--resume`) gives delta awareness. Fresh sessions don't.
- Prompt caching makes continued sessions cheaper, not more expensive.
- The digest file is the durable artifact. Survives session compaction.
- Haiku at $0.02-0.03/cycle is the right cost for background work.

**Evaluation checks:**
- [ ] `node gather.mjs --fixture fixtures/inbox-today.json fixtures/calendar-week.json` produces a digest
- [ ] `.claw/cache/digest.md` exists and contains structured sections
- [ ] `node claw.mjs "Any important emails?"` references digest content
- [ ] `skills/gather/SKILL.md` exists

**Part-task practice:** SECOND skill. Call back: "Same pattern as lesson 01."

---

## 03 -- Channels

**What they build:** Telegram channel via Vercel Chat SDK. Polling mode. Per-chat sessions. Docker + run.sh.

**Key files:** `channel.mjs`, `Dockerfile`, `run.sh`, `package.json`, `.env`

**Prerequisites:** Telegram bot token from @BotFather.

**Gotchas:**
- `onSubscribedMessage` for follow-ups, NOT `onNewMessage` (that's for regex patterns).
- `mode: "polling"` for local Docker. No public endpoint needed.
- `onLockConflict: "force"` for steerability when messages overlap.
- `spawn` not `execFileSync` in the claw. Channel needs async.
- Docker source mounting + ESM + node_modules doesn't work. Just COPY.

**Evaluation checks:**
- [ ] `channel.mjs` imports Chat SDK and creates adapter with `mode: "polling"`
- [ ] `.env` has `TELEGRAM_BOT_TOKEN`
- [ ] `./run.sh channel` starts and shows "Claw listening on Telegram"
- [ ] Sending a Telegram message gets a response
