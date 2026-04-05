# Lessons 04-05: TC3 (Make It Personal)

## 04 -- Memory

**What they build:** Self-curating MEMORY.md via background analyzer. Plugin with datetime hook. Interaction logging.

**Key files:** `memory.mjs`, `.claw/MEMORY.md`, `.claw/interactions.jsonl`, `.claude-plugin/plugin.json`, `hooks/hooks.json`, `bin/inject-datetime.sh`, `skills/memory/SKILL.md`

**Gotchas:**
- Host MCP servers bleed through OAuth credentials. Fix: `--strict-mcp-config`.
- `gws calendar +agenda` defaults to short lookahead. Always use `--days 10`.
- Memory analyzer uses Sonnet (~$0.03/cycle), not Opus.
- The analyzer only fires with 3+ new interactions. No interactions, no cost.
- `readIfExists` helper introduced here and reused in lesson 05.
- `LOG_FILE` must be defined as a constant near top of `claw.mjs`.

**Evaluation checks:**
- [ ] `.claude-plugin/plugin.json` exists with plugin name
- [ ] `hooks/hooks.json` has `UserPromptSubmit` hook
- [ ] `bin/inject-datetime.sh` is executable and outputs JSON with `additionalContext`
- [ ] After 3+ interactions, `node memory.mjs` produces `.claw/MEMORY.md`
- [ ] MEMORY.md has sections: Preferences, VIPs, Active Projects, Standing Orders, Patterns
- [ ] `skills/memory/SKILL.md` exists

**Part-task practice:** THIRD skill. Call back: "Same pattern as lessons 01 and 02."

**Recurrent skill note:** The `readIfExists` helper becomes a recurring pattern. Point it out when introduced. The learner should recognize it as infrastructure they'll reuse.

---

## 05 -- Soul

**What they build:** SOUL.md, IDENTITY.md, USER.md, BOOTSTRAP.md. Identity through conversation.

**Key files:** `SOUL.md`, `IDENTITY.md`, `USER.md`, `BOOTSTRAP.md` (self-destructs)

**Gotchas:**
- `--system-prompt` replaces the default. `--append-system-prompt` adds to it. For soul, replacing works better because the default prompt drowns out personality.
- BOOTSTRAP.md self-destructs via the agent's own Write tool. No code needed.
- Soul files go in system prompt. Memory/digest go in user message context.
- Bootstrap is opportunistic, not blocking. One question per response, at the end.
- Four files, not three. The lesson says "Four files" and lists all of them.

**Evaluation checks:**
- [ ] `SOUL.md` exists with personalized content (not just the template)
- [ ] `IDENTITY.md` has name, creature, vibe, emoji filled in (no "not yet" placeholders)
- [ ] `USER.md` has operator name and timezone
- [ ] `BOOTSTRAP.md` does NOT exist (self-destructed after completing)
- [ ] Asking the claw the same question produces responses with distinct personality/tone

**Prompt hierarchy (key supportive information):**

| Layer | File | Injected as | Changes |
|-------|------|-------------|---------|
| Soul | SOUL.md | System prompt | Rarely |
| Identity | IDENTITY.md | System prompt | Once (bootstrap) |
| Operator | USER.md | System prompt | Rarely |
| Bootstrap | BOOTSTRAP.md | System prompt | Self-destructs |
| Memory | MEMORY.md | User context | Every 10 minutes |
| Digest | digest.md | User context | Every gather cycle |
| Message | operator input | User message | Every turn |

This table is one of the most important pieces of supportive information in the course. If the learner is confused about what goes where, show this table.
