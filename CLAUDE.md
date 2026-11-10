# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Irona is a personal AI accountability agent (Mehak's 90-day career + fitness plan) built directly
on the raw Anthropic SDK — no agent framework. It reads goals/tasks from Notion, runs a tool-use
loop against Claude, and talks to Mehak over Telegram.

## Commands

```bash
npm install                              # install deps
npm run start-irona                      # start the Telegram bot (node index.js)
npm test                                 # run the full Vitest suite
npm run test-irona                       # run only tests/agent.test.js
npx vitest run tests/notion.test.js      # run only the Notion integration tests
npm run test:watch                       # vitest in watch mode
docker compose up -d                     # start local Redis (redis-dev, port 6379)
```

There is no lint/build script — the project is plain ES modules, run directly with Node 18+.

**The test suite is integration, not unit tests.** `tests/agent.test.js` and `tests/notion.test.js`
call the live Anthropic API and the live Notion databases — they need a real, filled-in `.env` and
will create/modify actual Notion rows. There are no mocks.

Husky hooks: `pre-commit` runs `npm test`; `pre-push` fails if `.env` and `.env.example` don't have
the same number of variables (keeps `.env.example` honest — update it whenever you add an env var,
leaving the value blank).

## Architecture

### The tool-use loop (`core/agent.js`)

`Irona.listen(message, chatId)` is the entire agent: one Anthropic `messages.create` call, then a
`while (stop_reason !== "end_turn")` loop (capped by `maxTurns = 10`) that executes any `tool_use`
blocks and feeds `tool_result`s back in. Model is hardcoded to `claude-haiku-4-5-20251001`.

- Each call to `listen()` starts `this.messages` from scratch with just the incoming message —
  there is **no cross-turn conversation history fed back into the prompt yet**. `STM.saveTurnData`
  (see below) persists the turn to Redis, but nothing currently reads it back in; `STM.getHistory`
  is an unimplemented stub. Don't assume multi-turn context exists when working on prompt/agent code.
- Multiple `tool_use` blocks in one response are dispatched concurrently with `Promise.all`, not
  sequentially — preserve this when touching the loop.
- Tool dispatch is a flat `switch` in `core/toolRegistry.js` that maps a tool name straight to a
  `Notion` method; adding a tool means updating three places in lockstep:
  1. `config/tools.js` — the JSON-schema tool definition Claude sees
  2. `core/toolRegistry.js` — the `switch` case wiring the name to a `Notion` method
  3. `tools/notion.js` — the actual Notion API call

### Notion as the source of truth (`tools/notion.js`)

Three linked Notion data sources, read/written via `@notionhq/client`'s `dataSources` API (not the
older `databases` API):

```
90-day goals (NOTION_GOALS_DS_ID)  ──▶  Weekly goals (NOTION_WEEKLY_GOALS_DS_ID)  ──▶  Daily agenda (NOTION_AGENDA_DS_ID)
      (the why)                              (the focus)                                  (the tasks)
```

Weekly goals are filtered by a `Week` select property (`W1`, `W2`, ... from `getCurrentWeekLabel()`
in `utils/week.js`); daily agenda rows are filtered by an exact `Date` match (today, or
yesterday for carry-over). All week/date math is anchored to `PLAN_START_DATE` in `.env` — never
hardcode a date or week number, always derive it through `utils/week.js`.

### Prompt as control flow (`config/constant.js`)

The system prompt is where most of the actual behavior is enforced, not code: it dictates a strict
tool-call order for daily agenda generation (`get_this_week_goals` → `get_yesterday_pending` →
`create_daily_agenda_task` × N) and a separate Sunday planning path (`save_weekly_goals` across all
tracks). When changing agent behavior, check whether the fix belongs in the prompt (ordering,
tone, what to reference) vs. the tool schema (`config/tools.js`, what data is available/required)
vs. the Notion layer (what's actually queryable). Tracks are a fixed enum across tools/prompt/Notion
schema: `DSA`, `System Design`, `AI/Agents`, `Health`, `Job Apps`.

### Transport (`transport/telegram.js`)

Long-polling Telegram bot gated to a single chat ID (`TELEGRAM_CHAT_ID`); any other chat gets
"Unauthorized." and is dropped. One `Irona` instance is shared across all incoming messages.

### Short-term memory (`memory/`, in progress)

`memory/redisClient.js` connects to Redis (`REDIS_URL`, see `docker-compose.yml` for local dev) and
exposes `isRedisConnected()`; connection failures are logged, not thrown, so the rest of the app
should keep working if Redis is down. `memory/STM.js` keys sessions as `${chatId}:${YYYY-MM-DD}` and
trims history to the last 40 entries. This layer is being built out — see the "no cross-turn
memory" note above before relying on it for context.
