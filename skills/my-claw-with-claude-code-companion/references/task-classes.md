# Task Classes & Gate Protocol

Based on van Merriënboer & Kirschner's 4C/ID model. The course organizes lessons into four task classes, each a more complex version of the whole task ("build and operate a personal AI familiar").

## TC1: Make It Talk (Lessons 00-01, support: high)

**Mental model:** The claw is a script that calls Claude and gets structured output back.

**What the learner masters:**
- `claude -p` with `--output-format json`
- `execFileSync` argument passing (not `execSync`)
- Session continuity via `--resume`
- The skill pattern: SKILL.md in `skills/`

**Scaffolding:** Full code shown. Every file complete and copy-pasteable. Explain every flag and argument.

### TC1 Gate (end of lesson 01)

Run these checks before advancing to TC2:

- [ ] `node claw.mjs "What is 2+2?"` returns a concise response
- [ ] `node claw.mjs "What did I just ask?"` remembers (session works)
- [ ] `node claw.mjs "What's on my calendar?"` runs `gws` and returns real data
- [ ] `skills/gws/SKILL.md` exists with command mappings

**If gate fails:** The learner cannot proceed. TC2 assumes `claw.mjs` works, sessions persist, and the gws skill returns real data. Debug the specific failing check.

**Common failure modes:**
- `gws auth setup` incomplete (OAuth not configured)
- Missing `.claude/settings.json` (gws commands blocked)
- `claude` not on PATH inside Docker

---

## TC2: Make It Useful (Lessons 02-03, support: medium)

**Mental model:** Two processes, two models, one coherent system. The claw splits into a gatherer (background, Haiku) and a responder (foreground, Opus).

**Supportive information to front-load:** The cost architecture is the mental model for this task class and every one after it. Present "Haiku for background, Opus for conversation" as a framing principle before showing code, not as an optimization tip after.

**What the learner masters:**
- Adapter pattern (same interface, different source)
- Background process + cached digest
- Docker containerization + run.sh launcher
- Telegram channel via Chat SDK
- Per-chat session management

**Scaffolding:** Code shown but not every line explained. The learner should start reading code and understanding patterns. Some sections require inference (run.sh variables, Docker args).

**Part-task practice:** Second SKILL.md (gather). Call back to lesson 01 explicitly: "Same pattern."

### TC2 Gate (end of lesson 03)

- [ ] `./run.sh gather --fixture` produces `.claw/cache/digest.md`
- [ ] `./run.sh channel` starts and responds to a Telegram message
- [ ] The claw answers from the digest, not live API calls
- [ ] Killing and restarting `./run.sh channel` picks up the existing session

**If gate fails:** TC3 requires a working channel for memory (interaction logging) and soul (bootstrap conversation). If the channel is broken, memory analysis will produce garbage.

**Common failure modes:**
- Docker image not built (run `./run.sh build`)
- `.env` missing `TELEGRAM_BOT_TOKEN`
- `onSubscribedMessage` vs `onNewMessage` confusion
- Chat SDK package names wrong or not installed

---

## TC3: Make It Personal (Lessons 04-05, support: medium)

**Mental model:** The claw stops being stateless. Memory and soul are two faces of the same thing: accumulated identity. Memory is what it learns about the operator. Soul is what it knows about itself.

**What the learner masters:**
- Plugin/hook system (datetime injection)
- Background analyzer on timer (Sonnet)
- `--strict-mcp-config` to kill auto-discovered servers
- `readIfExists` helper pattern (reused in lesson 05)
- System prompt injection (`--system-prompt`)
- Self-destructing bootstrap protocol
- Prompt hierarchy (soul > identity > operator > bootstrap > memory > digest > message)

**Scaffolding:** Drops to medium-low. Code patterns are established. Some implementations are described in prose rather than shown complete. The learner should be able to write the missing pieces.

**Part-task practice:** Third and fourth SKILL.md files (memory, plus soul files follow a similar pattern). The learner should notice they're getting faster at writing skills.

**Cost model deepening:** This task class adds the second model to the routing table (Sonnet for analysis). Reinforce: each new process gets the cheapest adequate model.

### TC3 Gate (end of lesson 05)

- [ ] `.claw/MEMORY.md` exists with real content (not empty)
- [ ] `IDENTITY.md` has no "not yet" placeholders
- [ ] `BOOTSTRAP.md` does NOT exist (self-destructed)
- [ ] The claw's responses have distinct personality when tested

**If gate fails:** TC4 assumes a fully personal claw at low support. If memory is empty, the analyzer hasn't run (check interaction count). If bootstrap hasn't completed, the learner needs more Telegram conversations.

**Scaffolding assessment:** Can the learner explain what `readIfExists` does without looking? Can they describe the prompt hierarchy? If not, review TC3 concepts before advancing. TC4 drops to low support.

---

## TC4: Make It Operational (Lessons 06-08, support: low)

**Mental model:** The claw goes from "thing you run" to "thing that runs." Operations = the system takes care of itself. Durability (survives), observability (sees itself), scheduling (acts on its own).

**What the learner masters:**
- launchd plist configuration
- Restart detection and notification
- Structured JSONL logging with high-cardinality fields
- Self-reporting (claw reads its own logs)
- Script gates (`wakeAgent` pattern)
- Cost architecture for scheduled tasks
- Separate launchd services (continuous vs periodic)

**Scaffolding:** Low. The learner writes code from patterns, not from copying blocks. Some implementations are explicitly sketched ("intentionally not production code"). The learner fills gaps.

**New domain:** launchd/systemd is likely unfamiliar. This is procedural information (deliver JIT when the learner encounters plist keys, don't front-load the explanation).

**Part-task practice:** Fifth and sixth SKILL.md files. By lesson 08, the learner should write skills automatically. If they hesitate, have them look at their `skills/` directory and see the pattern across all 6 skills.

### Course Completion

No gate after TC4. The learner has the full system. Point them to:
- **What's Next** (epilogue with challenges)
- **Glossary** (reference for all terms)

Celebrate what they built: nine layers, one coherent system.
