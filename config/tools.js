export const tools = [
  {
    name: "get_daily_agenda",
    description:
      "Fetch all tasks from today's Daily Agenda in Notion. Call this when the user asks what's on their agenda, what they should do today, wants a status update, or when you need page IDs to mark tasks done. Returns tasks with their IDs, titles, tracks, priority and done status.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_yesterdays_pending",
    description:
      "Fetch incomplete tasks from yesterday's agenda. Call this as part of generating today's agenda — yesterday's unfinished tasks should carry over. Do not call this in isolation.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
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
    name: "get_last_retro",
    description:
      "Fetch the most recent weekly retrospective from Notion. Call this when generating today's agenda to understand what strategy changes were made last Sunday. Contains what worked, what didn't, and next week focus.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "create_daily_agenda_task",
    description:
      "Create a single task in today's Daily Agenda in Notion. Call this MULTIPLE TIMES in parallel after fetching weekly goals, yesterday's pending, and last retro. Create 3-5 tasks per day covering different tracks. Each call creates exactly one task — do not batch multiple tasks into one call.",
    input_schema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description:
            "Clear, actionable task title. Example: 'Solve 3 LeetCode heap problems' not just 'LeetCode'",
        },
        priority: {
          type: "string",
          description: "Task priority level",
          enum: ["High", "Medium", "Low"],
        },
        track: {
          type: "string",
          description: "Which 90-day goal track this task contributes to",
          enum: ["DSA", "System Design", "AI/Agents", "Health", "Job Apps"],
        },
        notes: {
          type: "string",
          description:
            "Optional context for the task. Example: 'Focus on MinHeap implementation, carry over from yesterday'",
        },
      },
      required: ["title", "priority", "track"],
    },
  },
  {
    name: "mark_task_done",
    description:
      "Mark a task as done in Notion. ALWAYS call get_daily_agenda first to fetch today's tasks and find the page_id that matches what the user said they completed. Match by title or track. Example: user says 'done DSA' → get agenda → find DSA task → call this with its page_id.",
    input_schema: {
      type: "object",
      properties: {
        page_id: {
          type: "string",
          description:
            "Notion page ID of the task to mark done. Must be obtained from get_daily_agenda first — never guess or fabricate this value.",
        },
        notes: {
          type: "string",
          description:
            "Optional notes the user wants to add. Example: 'solved in O(n log n), used min heap pattern'",
        },
      },
      required: ["page_id"],
    },
  },
  {
    name: "save_weekly_retro",
    description:
      "Save the weekly retrospective to Notion. Call this every Sunday evening after asking the user these 3 questions: 'What clicked this week?', 'What drained you?', 'One thing to change?'. Also compute completion stats from the week's agenda before calling.",
    input_schema: {
      type: "object",
      properties: {
        ai_agents_done: {
          type: "number",
          description: "Number of AI/Agents tasks completed this week",
        },
        completion_rate: {
          type: "number",
          description:
            "Overall task completion percentage for the week (0-100)",
        },
        dsa_done: {
          type: "number",
          description: "Number of DSA tasks completed this week",
        },
        health_done: {
          type: "number",
          description: "Number of Health tasks completed this week",
        },
        job_apps_done: {
          type: "number",
          description: "Number of Job Apps tasks completed this week",
        },
        system_design_done: {
          type: "number",
          description: "Number of System Design tasks completed this week",
        },
        what_worked: {
          type: "string",
          description: "User's answer to 'What clicked this week?'",
        },
        what_didnt_work: {
          type: "string",
          description: "User's answer to 'What drained you?'",
        },
        strategy_change: {
          type: "string",
          description: "User's answer to 'One thing to change next week?'",
        },
        next_week_focus: {
          type: "string",
          description:
            "Main priority track for next week based on retro analysis. Example: 'Job Apps — zero applications sent this week'",
        },
      },
      required: [
        "completion_rate",
        "what_worked",
        "what_didnt_work",
        "strategy_change",
        "next_week_focus",
      ],
    },
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
