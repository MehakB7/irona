# 🤖 Irona — Personal AI Accountability Agent

Irona is a personal accountability agent built on **Claude (Anthropic)** that turns my
long-term goals into a daily plan and holds me to it over Telegram. It reads my 90-day
goals and weekly focus from Notion, generates each day's agenda, carries over whatever I
didn't finish yesterday, and lets me close out tasks by just messaging it in plain English.

Built from scratch — no agent framework — to understand agent internals: the
**tool-use loop**, **parallel tool execution**, and **multi-tool orchestration** on the
raw Anthropic SDK.

---

## ✨ What Irona Can Do

| Capability | Tool | Description |
| --- | --- | --- |
| 🎯 Read 90-day goals | `get_active_goals` | Fetch the long-term goals that drive weekly planning |
| 🗓️ Read weekly focus | `get_this_week_goals` | Fetch this week's goals — the bridge from 90-day goals to daily tasks |
| 📋 Read today's agenda | `get_daily_agenda` | Fetch today's tasks (and their page IDs) |
| ➕ Add a task | `create_daily_agenda_task` | Create one task in today's agenda |
| ✅ Mark a task done | `mark_task_done` | Close out a task by its Notion page ID |
| ↪️ Carry over misses | `get_yesterday_pending` | Pull yesterday's unfinished tasks so they roll into today |
| 🧭 Plan the week | `save_weekly_goals` | Generate and save next week's goals across all tracks |

Tracks: **DSA · System Design · AI/Agents · Health · Job Apps**

**Example prompts (over Telegram):**

```
> "Generate my agenda for today"
> "Mark the task done"
> "What's left on today's list?"
> "Plan my goals for this week"
```

---

## 🧠 How It Works

### The agent loop

Irona runs a standard tool-use loop against the Anthropic Messages API. Claude decides
which tools to call; Irona executes them and feeds the results back until Claude is done.

```
User message
     │
     ▼
Claude API call (with all tool schemas)
     │
     ▼
Response contains tool_use blocks?
  ├── YES → run tools → append tool_results → loop back to Claude
  └── NO  → return final text → send over Telegram
```

A `maxTurns` guard (default 10) prevents runaway loops.

### Parallel tool execution

When Claude returns several `tool_use` blocks in one response (e.g. read weekly goals
*and* read yesterday's pending), Irona dispatches them concurrently with `Promise.all`
rather than awaiting each in sequence:

```js
const toolResults = await Promise.all(
  toolUseBlocks.map(async (tool) => ({
    type: "tool_result",
    tool_use_id: tool.id,
    content: JSON.stringify(await toolRegistry.execute(tool.name, tool.input)),
  }))
);
```

### Notion as the source of truth

The accountability system is three linked Notion databases:

```
90-day goals  ──▶  Weekly goals  ──▶  Daily agenda
 (the why)         (the focus)        (the tasks)
```

Daily agenda generation always reads this week's goals **and** yesterday's unfinished
tasks first, so nothing silently falls through.

---

## 🗂️ Project Structure

```
irona/
├── core/
│   ├── agent.js          # The agent loop — Claude call → tools → loop → final text
│   └── toolRegistry.js   # Maps tool names to Notion methods
├── tools/
│   └── notion.js         # Notion DB integration (goals, weekly, daily agenda)
├── transport/
│   └── telegram.js       # Inbound Telegram bot (auth-gated to one chat ID)
├── config/
│   ├── tools.js          # Claude tool definitions (JSON schema)
│   └── constant.js       # System prompt
├── utils/
│   └── week.js           # Week label + days-remaining helpers
├── tests/
│   ├── agent.test.js     # Agent-loop integration tests
│   └── notion.test.js    # Notion integration tests
└── index.js              # Entry point — starts the Telegram transport
```

---

## 🛠️ Tech Stack

| Layer | Tech |
| --- | --- |
| LLM | Claude `claude-haiku-4-5` via the Anthropic SDK |
| Notes/Goals | Notion API (`@notionhq/client`) |
| Messaging | Telegram (`node-telegram-bot-api`, polling) |
| Runtime | Node.js 18+ (ES Modules) |
| Tests | Vitest |
| Config | dotenv |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Anthropic API key
- Notion integration token + three databases (90-day goals, weekly goals, daily agenda)
- Telegram bot token (via [@BotFather](https://t.me/botfather)) and your chat ID

### Setup

```bash
git clone https://github.com/MehakB7/irona
cd irona
npm install
cp .env.example .env   # then fill in your keys and database IDs
```

### Environment variables

See `.env.example`. You'll need:

```
ANTHROPIC_API_KEY=             # Anthropic API key
NOTION_TOKEN=                  # Notion integration token
NOTION_AGENDA_DS_ID=           # Daily Agenda data source ID
NOTION_GOALS_DS_ID=            # 90-day Goals data source ID
NOTION_WEEKLY_GOALS_DS_ID=     # Weekly Goals data source ID
TELEGRAM_BOT_TOKEN=            # Telegram bot token
TELEGRAM_CHAT_ID=              # Your Telegram chat ID (only this chat is allowed)
PLAN_START_DATE=               # Plan start date, e.g. 2026-07-01 (drives week labels)
```

### Run

```bash
npm run start-irona     # starts the Telegram bot
# or
node index.js
```

Then message your bot on Telegram.

### Test

```bash
npm test                # runs the Vitest suite
```

> Note: the tests are **integration** tests — they hit live Notion and Anthropic, so
> they require a valid `.env` and will create/modify real Notion rows.

---

## 📚 What I Learned Building This

- **Multi-tool calling** — Claude can return several `tool_use` blocks in one response;
  handling that array (and matching each result back by `tool_use_id`) is the core of the loop.
- **Parallel execution** — independent tool calls should run concurrently; sequential
  `await`s compound latency for no reason.
- **Prompt as control flow** — the system prompt enforces a strict agenda-generation
  order (read weekly goals → read yesterday's pending → create tasks) so the agent behaves
  predictably instead of improvising.
- **Going framework-free** — building the loop by hand made the tradeoffs of agent
  frameworks legible, rather than hidden behind abstractions.

---

## 🧭 Roadmap

Honest about what's *not* built yet:

- [ ] **Cross-turn memory** — conversations currently start fresh each message; add a
      per-chat sliding-window history.
- [ ] **Graceful tool-error recovery** — return tool failures as `tool_result` errors so
      the agent can respond instead of aborting the turn.
- [ ] **Proactive scheduling** — `node-cron` morning agenda push, evening check-in, and a
      mid-week nudge. (This is what makes it an *accountability* agent, not a reactive one.)
- [ ] **Weekly retro loop** — generate a data-driven Sunday retro from completion stats to
      feed next week's planning.
- [ ] **Calendar + CLI transports** — Google Calendar tools and an Enquirer CLI adapter.

---

## 🙏 Inspiration

Named after **Irona**, Richie Rich's tireless robot assistant. Same idea: handle the
operational overhead so I can focus on the work that actually moves the needle.
