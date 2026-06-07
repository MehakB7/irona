export const tools = [
    {
        name: "get_daily_agenda",
        description: "Fetch today's tasks from Notion Daily Agenda. Call this when user asks what's on their agenda today, or when you need page IDs to mark tasks done.",
        input_schema: { type: "object", properties: {}, required: [] }
    },
    {
        name: "create_daily_agenda_task",
        description: "Create a single task in today's Daily Agenda. Call this MULTIPLE TIMES in parallel to build today's agenda. Each call = one task. Be hyper specific — include LC number, problem name, core insight, time target.",
        input_schema: {
            type: "object",
            properties: {
                title: {
                    type: "string",
                    description: "Specific task title. Example: 'LC 167 Two Sum II — opposite ends, move based on sum vs target. 20 mins.'"
                },
                priority: {
                    type: "string",
                    enum: ["High", "Medium", "Low"]
                },
                track: {
                    type: "string",
                    enum: ["DSA", "System Design", "AI/Agents", "Health", "Job Apps"]
                },
                notes: {
                    type: "string",
                    description: "Optional extra context"
                }
            },
            required: ["title", "priority", "track"]
        }
    },
    {
        name: "mark_task_done",
        description: "Mark a task done in Notion. ALWAYS call get_daily_agenda first to find the page_id matching what user said. Never guess the page_id.",
        input_schema: {
            type: "object",
            properties: {
                page_id: {
                    type: "string",
                    description: "Notion page ID from get_daily_agenda. Never fabricate this."
                },
                notes: {
                    type: "string",
                    description: "Optional completion notes"
                }
            },
            required: ["page_id"]
        }
    }
]