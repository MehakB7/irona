# 🤖 Irona — Personal AI Assistant Agent

> *"Irona was Richie Rich's robot maid. This one's mine."*

Irona is a **transport-agnostic AI agent** built on top of Claude (Anthropic) that manages your calendar, writes meeting notes to Notion, and sends you Telegram notifications — all from a single natural language command.

Built from scratch to learn the internals of agent systems: **parallel tool execution**, **multi-tool orchestration**, and **token-aware context management**.

---

## ✨ What Irona Can Do

| Capability | Tool | Description |
|---|---|---|
| 📅 Check calendar | `check_calendar` | Fetch today's or this week's events |
| ➕ Add appointments | `add_appointment` | Create Google Calendar events |
| 📝 Write meeting notes | `write_notion_note` | Log notes or daily work to Notion |
| 🔔 Send notifications | `send_telegram` | Push alerts to your Telegram |
| 🗂️ Daily summary | `get_daily_summary` | Composite — triggers all of the above |

**Example prompts:**
```
> "What does my day look like?"
> "Add a standup at 2:30 PM tomorrow with the design team"
> "Write a note in Notion: discussed API rate limits, action item is to add retry logic"
> "Send me a reminder in 10 minutes about the client call"
```

---

## 🧠 Architecture

Irona is designed around three principles:

### 1. Transport-Agnostic Core
The agent brain doesn't know or care whether you're talking to it via CLI or Telegram. Both are just **I/O adapters** that feed into the same `agent.js` loop.

```
CLI Input  ──┐
             ├──▶  Agent Core  ──▶  Tools  ──▶  Response
Telegram   ──┘
```

### 2. Parallel Tool Execution
When Claude decides it needs multiple tools (e.g. check calendar *and* write a Notion note), Irona dispatches them **simultaneously** with `Promise.all` — not sequentially. This is the core performance insight.

```js
// Instead of awaiting each tool one by one:
const results = await Promise.all(
  toolCalls.map(call => toolRegistry.execute(call))
);
```

### 3. Token-Aware Context Management
Conversations don't grow unboundedly. Irona uses a **sliding window** strategy — recent turns stay in full fidelity, older ones get summarized into a compressed system message. Tool results are also stripped to only the fields that matter.

---

## 🗂️ Project Structure

```
irona/
├── core/
│   ├── agent.js            # The agent loop — receives intent, calls tools, responds
│   ├── toolRegistry.js     # Register tools; dispatch single or parallel calls
│   └── contextManager.js   # Sliding window + token budget management
├── tools/
│   ├── calendar.js         # Google Calendar integration (read/write)
│   ├── notion.js           # Notion pages & databases
│   └── telegram.js         # Outbound Telegram notifications
├── transports/
│   ├── cli.js              # Enquirer-based interactive CLI
│   └── telegramBot.js      # Telegram Bot polling (inbound messages)
├── config/
│   └── tools.js            # Claude tool definitions (JSON schema)
└── index.js                # Entry point — wires transports to agent core
```

---

## 🔄 Agent Loop

```
User message
     │
     ▼
contextManager.buildHistory()   ← trims to token budget
     │
     ▼
Claude API call (with all tool schemas)
     │
     ▼
Response contains tool_use blocks?
  ├── YES → Promise.all(toolCalls) → append tool_results → loop back
  └── NO  → Final response → transport.send() + telegram.notify()
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| LLM | Claude (claude-haiku-3-5) via Anthropic SDK |
| CLI | Node.js + Enquirer |
| Telegram | node-telegram-bot-api (polling) |
| Calendar | Google Calendar API v3 |
| Notes | Notion API |
| Runtime | Node.js (ES Modules) |
| Config | dotenv |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Anthropic API key
- Google Cloud project with Calendar API enabled
- Notion integration token
- Telegram Bot token (via [@BotFather](https://t.me/botfather))

### Setup

```bash
git clone https://github.com/yourusername/irona
cd irona
npm install
cp .env.example .env
# Fill in your API keys
```

### Environment Variables

```env
ANTHROPIC_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
NOTION_TOKEN=
NOTION_DATABASE_ID=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

### Run

```bash
# CLI mode
node index.js --transport cli

# Telegram mode
node index.js --transport telegram
```

---

## 📚 What I Learned Building This

This project was built deliberately to understand agent internals:

- **Multi-tool calling** — Claude can return multiple `tool_use` blocks in a single response. Handling that array correctly is non-trivial.
- **Parallel execution** — Sequential tool calls compound latency. `Promise.all` is the right mental model for independent tool calls.
- **Token efficiency** — Naive context appending blows through limits fast. A sliding window + tool result compression strategy keeps costs predictable.
- **Transport abstraction** — Keeping the agent core pure and letting adapters handle I/O makes the system dramatically easier to extend.



## 🙏 Inspiration

Named after **Irona**, Richie Rich's loyal robot assistant. The goal is the same: a capable, tireless assistant that handles the operational overhead so you can focus on what matters.

---
