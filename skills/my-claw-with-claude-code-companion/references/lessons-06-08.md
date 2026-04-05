# Lessons 06-08: TC4 (Make It Operational)

## 06 -- Durability

**What they build:** launchd plist that starts the claw on login, restarts on crash, and notifies on Telegram when it comes back.

**Key files:** `service/my-claw.plist.template`, `service/install.sh`, `.claw/owner-chat-id`, `.claw/last-start`, `skills/service/SKILL.md`

**Gotchas:**
- `launchctl bootstrap`/`bootout` is the modern API. `load`/`unload` is deprecated.
- `.claw/` must be on the host filesystem, not inside the container. Mount it.
- `bot.channel(chatId)` not `bot.openDM()` for restart notifications. Numeric IDs need the adapter prefix (`telegram:123456`).
- `ThrottleInterval: 10` prevents crash loops from eating the machine.
- 5-second delay before restart notification gives Telegram adapter time to connect.
- Restart code goes in existing `channel.mjs`, after `bot.initialize()`. The `bot` variable must be in scope.

**Evaluation checks:**
- [ ] `service/my-claw.plist.template` has `RunAtLoad`, `KeepAlive`, and `ThrottleInterval`
- [ ] `./service/install.sh` runs without error and loads the plist
- [ ] Killing the Docker container triggers launchd restart within 10 seconds
- [ ] After restart, operator receives "I'm back" message on Telegram
- [ ] `.claw/` directory persists across restarts (sessions, memory, digest all intact)
- [ ] `skills/service/SKILL.md` exists

**Part-task practice:** FIFTH skill. "Same pattern as before."

**New domain note:** launchd is likely unfamiliar. Deliver plist key explanations JIT (when the learner reads the template), not before the lesson.

---

## 07 -- Observability

**What they build:** Structured JSONL logging with high-cardinality fields. The claw reads its own activity summary. Operator queries with jq.

**Key files:** `log.mjs`, `.claw/logs/claw.jsonl`, `CLAUDE.md` (observability section), `skills/logs/SKILL.md`

**Gotchas:**
- `ts` (millisecond epoch) for querying, `t` (ISO string) for reading. Both on every entry.
- `query()` reads from end of file for recency. Reverse chronological, then re-reverse for output.
- Activity summary injected as `[SYSTEM ACTIVITY]` in claw context. Update CLAUDE.md to tell the claw to use it.
- `run.sh logs`, `run.sh costs`, `run.sh errors` for operator-side jq queries. Case statements shown in lesson.
- `summarize()` builds a concise multi-line summary with interaction count, gather cycles, errors, total cost.

**Evaluation checks:**
- [ ] `log.mjs` exports `log`, `query`, and `summarize` functions
- [ ] After interactions, `.claw/logs/claw.jsonl` contains structured entries with `type`, `ts`, `t`
- [ ] `node -e "import('./log.mjs').then(m => console.log(m.summarize(24)))"` produces a readable summary
- [ ] `claw.mjs` includes activity summary in context before responding
- [ ] `./run.sh costs` outputs cost breakdown by type
- [ ] `skills/logs/SKILL.md` exists

**Part-task practice:** FIFTH skill (logs). "Same skill pattern."

---

## 08 -- Scheduling

**What they build:** Scheduled tasks with script gates. A second launchd service runs every 15 minutes. Bash gates decide if work is worth doing before spending tokens. Notifications are opt-in.

**Key files:** `schedule.mjs`, `schedule.json`, `gates/*.sh`, `service/my-claw-schedule.plist.template`, `skills/schedule/SKILL.md`

**Gotchas:**
- Script gates exit with no output to close (skip). JSON output with `wakeAgent: true` to open (wake the claw).
- `StartInterval` not `KeepAlive` for periodic tasks. The scheduler runs and exits, not continuously.
- Time-window gates need a "last run" file to prevent firing every cycle during the window.
- Cost architecture matters. Opus every 15 minutes is $3.84/day. Script gates cut that by 90%.
- `stat -f %m` on macOS, `stat -c %Y` on Linux. Gates need to handle both if targeting Docker.
- Default is silent. Claw writes files, not messages. `notify: true` is opt-in per task.
- Scheduled tasks call `claude -p` directly, not through `claw.mjs`. They don't need soul, memory, or sessions. Fire-and-forget.

**Evaluation checks:**
- [ ] `schedule.json` has at least one task with `name`, `gate`, and `prompt`
- [ ] `gates/` has at least one executable `.sh` file
- [ ] Running a gate script produces either no output (closed) or JSON with `wakeAgent` (open)
- [ ] `node schedule.mjs` runs gates and logs results to `.claw/logs/claw.jsonl`
- [ ] `service/my-claw-schedule.plist.template` has `StartInterval` (not `KeepAlive`)
- [ ] No task sends unsolicited messages unless `notify: true` is set
- [ ] `skills/schedule/SKILL.md` exists

**Part-task practice:** SIXTH and FINAL skill. "Last skill. By now you know the pattern cold." If the learner hesitates, have them `ls skills/` and see the consistency across all 6 skills.

**Course completion:** After this lesson, point the learner to the "What's Next" epilogue and the glossary. Celebrate: nine layers, one coherent system.
