import Notion from "../tools/notion.js";

export const toolRegistry = {
  async execute(tool_name, tool_input) {
    switch (tool_name) {
      case "get_daily_agenda":
        return Notion.getDailyAgenda();

      case "get_yesterdays_pending":
        return Notion.getYesterdayPending();

      case "get_this_week_goals":
        return Notion.getThisWeekGoals();

      case "get_last_retro":
        return Notion.getLastRetro();

      case "create_daily_agenda_task":
        return Notion.createDailyAgendaTask(tool_input);

      case "mark_task_done":
        return Notion.markTaskDone(tool_input.page_id);

      case "save_weekly_retro":
        return Notion.saveWeeklyRetro({
          aiAgnet: tool_input.ai_agents_done,
          completionRate: tool_input.completion_rate,
          dSADone: tool_input.dsa_done,
          healthDone: tool_input.health_done,
          jobApplicationDone: tool_input.job_apps_done,
          systemDesignDone: tool_input.system_design_done,
          whatWork: tool_input.what_worked,
          whatNotWork: tool_input.what_didnt_work,
          statergyChange: tool_input.strategy_change,
          nextWeekFocus: tool_input.next_week_focus,
        });

      case "save_weekly_goals":
        return Notion.saveWeeklyGoals(
          tool_input.goals.map((g) => ({
            goal: g.goal,
            track: g.track,
            priority: g.priority,
            whyThisWeek: g.why_this_week,
            successCriteria: g.success_criteria,
            week: getCurrentWeekLabel(), // ← auto-calculated
          })),
        );

      default:
        throw new Error(`Unknown tool: ${tool_name}`);
    }
  },
};
