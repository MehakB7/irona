# 🤖 Irona — Personal AI Assistant Agent

> *"Irona was Richie Rich's robot maid. This one's mine."*

Irona is a **transport-agnostic AI agent** built on Claude (Anthropic) that manages your 90-day goals, generates your daily agenda, tracks progress, and sends you Telegram notifications — all from natural language commands.

Built from scratch to learn agent internals: **parallel tool execution**, **multi-tool orchestration**, **token-aware context management**, and **Notion as persistent memory**.

---

## ✨ What Irona Does

| When | What Irona Does |
|---|---|
| Every morning 8AM | Reads weekly goals + yesterday's pending → generates today's agenda → sends Telegram |
| Every hour | Checks pending tasks → nudges you if anything is overdue |
| You say "done DSA" | Matches to today's task → marks Done in Notion |
| Every Sunday 7PM | Computes week stats → asks 3 retro questions → writes retro → plans next week |

**Example conversations:**
```
You   → "done running and gym"
Irona → ✅ Marked done: Morning run 8km, Gym session 💪

You   → "what's pending today?"
Irona → 2 tasks still open: LeetCode heap problem 🔴, System design reading 🟡
```

---

## 🧠 Architecture

### Three Core Principles

**1. Transport-Agnostic Core**
The agent brain doesn't know or care whether input comes from CLI or Telegram. Both are I/O adapters feeding the same `agent.js` loop.

```
CLI Input  ──┐
             ├──▶  Agent Core  ──▶  Tools  ──▶  Response
Telegram   ──┘
```

**2. Parallel Tool Execution**
When Claude needs multiple tools simultaneously, Irona dispatches them all at once — not sequentially.

```js
const [goals, weekGoals, pending, retro] = await Promise.all([
    notion.getActiveGoals(),
    notion.getThisWeekGoals(),
    notion.getYesterdayPending(),
    notion.getLastRetro()
])
```

**3. Notion as Persistent Memory**
Irona doesn't need an external memory store. Notion IS the memory — structured, queryable, and human-readable. Every session starts by reading Notion, every action writes back to it.

---

## 🗂️ Project Structure

```
irona/
├── core/
│   ├── agent.js            # Agent loop — receives intent, calls tools, responds
│   ├── toolRegistry.js     # Register tools, dispatch single or parallel calls
│   └── contextManager.js   # Sliding window + token budget + session cache
├── tools/
│   ├── notion.js           # NotionManager class — all DB read/write operations
│   └── telegram.js         # Outbound Telegram notifications
├── transports/
│   ├── cli.js              # Interactive CLI (Enquirer)
│   └── telegramBot.js      # Telegram Bot polling (inbound messages)
├── utils/
│   └── week.js             # getCurrentWeekLabel(), getDaysRemaining()
├── config/
│   └── tools.js            # Claude tool definitions (JSON schema)
├── test.js                 # Local test runner for all Notion methods
└── index.js                # Entry point — wires transports to agent core
```

---

## 🗄️ Notion Data Architecture

Four databases. One direction of data flow.

```
🎯 90 Day Goals DB       ← you set once, Irona reads forever
        ↓ informs
📋 Weekly Goals DB       ← Irona writes every Sunday POST retro
        ↓ informs
📅 Daily Agenda DB       ← Irona writes every morning
        ↑ you mark done via Telegram throughout day
        ↓ read every Sunday to compute week stats
📝 Weekly Retro DB       ← Irona writes every Sunday PRE planning
        ↑ feeds back into next week's goals
```

### NotionManager — 9 Methods

```js
// READS — called in parallel every morning
getActiveGoals()          → 90 Day Goals (north stars)
getThisWeekGoals()        → Weekly Goals (this week's focus)
getYesterdayPending()     → Daily Agenda (what got skipped)
getLastRetro()            → Weekly Retro (strategy context)

// READS — Sunday retro
getThisWeekAgenda()       → Daily Agenda (last 7 days for stat calculation)

// WRITES — daily
createDailyAgendaTask()   → Daily Agenda
markTaskDone(pageId)      → Daily Agenda (triggered by Telegram message)

// WRITES — Sunday
saveWeeklyRetro()         → Weekly Retro
saveWeeklyGoals([])       → Weekly Goals (parallel Promise.all)
```

### Notion SDK v5 — Breaking Change

SDK v5 changed how querying works. All reads now use `dataSources.query` with `data_source_id` (the collection ID), not `databases.query` with `database_id`. Your `.env` must use **data source IDs**.

```js
// Reading (SDK v5)
notion.dataSources.query({ data_source_id: '...' })

// Writing (unchanged in v5)
notion.pages.create({ parent: { data_source_id: '...' } })
notion.pages.update({ page_id: '...' })
```

---

## 🔄 Agent Loop

```
User message
     │
     ▼
contextManager.buildHistory()   ← trims to token budget, serves from cache
     │
     ▼
Claude API call (with all tool schemas)
     │
     ▼
Response contains tool_use blocks?
  ├── YES → Promise.all(toolCalls) → append tool_results → loop back
  └── NO  → Final text response → transport.send()
```

---

## ⚙️ Context Manager — Token Efficiency

```js
// Load once per session, serve from cache
this.sessionCache = {
    todayTasks: null,   // fetched once, reused all day
    weekGoals: null,    // fetched once, reused all day
    lastRetro: null     // fetched once, reused all day
}

// When task is marked done → update cache + Notion
// No repeat API calls for same data within a session
```

Older conversation turns get summarized into a single system message. Tool results are stripped to only the fields Claude needs — not the full raw API response.

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| LLM | Claude (claude-haiku) via Anthropic SDK |
| CLI | Node.js + Enquirer |
| Telegram | node-telegram-bot-api (polling) |
| Memory | Notion API v5 (`@notionhq/client`) |
| Scheduling | node-cron |
| Runtime | Node.js 18+ (ES Modules) |
| Config | dotenv |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Anthropic API key
- Notion integration token
- Telegram Bot token (via [@BotFather](https://t.me/botfather))

### Setup

```bash
git clone https://github.com/yourusername/irona
cd irona
npm install
cp .env.example .env
```

### Environment Variables

```env
# Anthropic
ANTHROPIC_API_KEY=

# Notion — use data source IDs (collection IDs), not database IDs
NOTION_TOKEN=
NOTION_GOALS_DB_ID=
NOTION_AGENDA_DB_ID=
NOTION_RETRO_DB_ID=
NOTION_WEEKLY_GOALS_DB_ID=

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Plan config
PLAN_START_DATE=2026-03-15
```

### Run

```bash
# Test all Notion methods locally first
node test.js

# CLI mode
node index.js --transport cli

# Telegram mode
node index.js --transport telegram
```

---

## 📅 Cron Schedule

```js
cron.schedule('0 8 * * *',  () => irona.sendDailyAgenda())    // 8AM daily
cron.schedule('0 * * * *',  () => irona.sendHourlyReminder()) // every hour
cron.schedule('0 19 * * 0', () => irona.sundaySession())      // Sunday 7PM
```

---

## 📚 What I Learned Building This

- **Multi-tool calling** — Claude returns multiple `tool_use` blocks in one response. Feeding all `tool_result` blocks back correctly before the next turn is the core agentic pattern.
- **Parallel execution** — `Promise.all` on four Notion calls drops morning agenda latency from ~2s to ~500ms. Sequential tool calls compound badly at scale.
- **Token efficiency** — session caching means Irona never fetches the same Notion data twice in one conversation. Combined with sliding window history, token costs stay flat.
- **Notion SDK v5** — `databases.query` → `dataSources.query`. Learned by hitting the error in production, not by reading the migration guide. Data source IDs and database IDs are different — use the collection ID for everything.
- **Transport abstraction** — pure agent core + adapter pattern makes adding new transports (web UI, Slack) a matter of implementing one interface, not touching core logic.
- **Error strategy** — NotionManager throws with method name in the message, agent loop catches and decides fallback behavior. Separation of concerns makes debugging fast.
- **Notion as memory** — no Redis, no vector DB, no custom persistence layer. The databases ARE the memory. Simple, inspectable, and human-editable.

---

## 🗺️ Roadmap

- [x] Notion data architecture — 4 databases, clean data flow
- [x] NotionManager — 9 methods, full CRUD
- [x] utils/week.js — week label + days remaining calculation
- [x] Notion SDK v5 migration — dataSources.query
- [x] Error handling — private #handleError pattern
- [ ] Agent loop — parallel tool dispatch
- [ ] Tool registry — plug-and-play tool registration
- [ ] Context manager — sliding window + session cache
- [ ] CLI transport
- [ ] Telegram transport (polling)
- [ ] Morning agenda cron (8AM)
- [ ] Hourly nudge cron
- [ ] Sunday retro + planning session
- [ ] Deploy to Railway

---

*Named after Irona — Richie Rich's robot maid. Built during a 90-day career grind, March–June 2026.*

*Built by Mehak — frontend engineer exploring AI agent systems.*