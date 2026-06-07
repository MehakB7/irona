export const tools = [
    {
        name:"get_active_goals",
        description:"Returns Mehak's current 90-day goals. Call this ONLY when generating weekly goals on Sunday. For daily agenda generation use get_this_week_goals instead — it has the specific weekly breakdown needed for daily tasks.",
        input_schema:{type:"object", properties:{}, required:[]}
    },
    {
    name: "get_this_week_goals",
    description:
      "Fetch this week's goals from Notion. Call this when generating today's agenda or when the user asks about their weekly focus. Weekly goals are the bridge between 90-day goals and daily tasks.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },

  {
    name: "get_daily_agenda",
    description:
      "Fetch today's tasks from Notion Daily Agenda. Call this when user asks what's on their agenda today, or when you need page IDs to mark tasks done.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "create_daily_agenda_task",
    description:
      "Creates a single task in today's Daily Agenda in Notion. Call this tool once per task after fetching weekly goals. Each call creates one row.",
    input_schema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description:
            "Specific task title. Example: 'LC 167 Two Sum II — opposite ends, move based on sum vs target. 20 mins.'",
        },
        priority: {
          type: "string",
          enum: ["High", "Medium", "Low"],
        },
        track: {
          type: "string",
          enum: ["DSA", "System Design", "AI/Agents", "Health", "Job Apps"],
        },
        notes: {
          type: "string",
          description: "Optional extra context",
        },
      },
      required: ["title", "priority", "track"],
    },
  },
  {
    name: "mark_task_done",
    description:
      "Mark a task done in Notion. ALWAYS call get_daily_agenda first to find the page_id matching what user said. Never guess the page_id.",
    input_schema: {
      type: "object",
      properties: {
        page_id: {
          type: "string",
          description:
            "Notion page ID from get_daily_agenda. Never fabricate this.",
        },
        notes: {
          type: "string",
          description: "Optional completion notes",
        },
      },
      required: ["page_id"],
    },
  },
  {
    name: "get_yesterday_pending",
    description:
      "Fetch incomplete tasks from yesterday. ALWAYS call this when generating today's agenda — yesterday's unfinished tasks must carry over to today.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "save_weekly_goals",
    description:
      "Save next week's goals to Notion. Call this every Sunday AFTER save_weekly_retro has been called. Claude generates 3-5 goals across different tracks based on 90-day goals, the retro just written, and completion stats. Each goal in the array creates one row in the Weekly Goals database.",
    input_schema: {
      type: "object",
      properties: {
        goals: {
          type: "array",
          description:
            "List of weekly goals to create. Each item creates one row in Notion.",
          items: {
            type: "object",
            properties: {
              goal: {
                type: "string",
                description:
                  "Clear, measurable goal title. Example: 'Send 2 job applications to Supabase and Whereby'",
              },
              track: {
                type: "string",
                description: "Which 90-day track this goal belongs to",
                enum: [
                  "DSA",
                  "System Design",
                  "AI/Agents",
                  "Health",
                  "Job Apps",
                ],
              },
              priority: {
                type: "string",
                description:
                  "Priority level — set Job Apps to High if no applications were sent last week",
                enum: ["High", "Medium", "Low"],
              },
              why_this_week: {
                type: "string",
                description:
                  "Why this goal is important THIS specific week. Reference retro data. Example: 'Zero applications sent last week — this is the critical gap'",
              },
              success_criteria: {
                type: "string",
                description:
                  "How you know the goal is done. Example: 'Can implement MinHeap blindly + solved 5 problems'",
              },
            },
            required: [
              "goal",
              "track",
              "priority",
              "why_this_week",
              "success_criteria",
            ],
          },
        },
      },
      required: ["goals"],
    },
  },
];
