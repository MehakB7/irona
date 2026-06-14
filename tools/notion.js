import { Client } from "@notionhq/client";
import { getCurrentWeekLabel } from "../utils/week.js";

class NotionManager {
  constructor() {
    this.notionClient = new Client({ auth: process.env.NOTION_TOKEN });
    this.dailyAgendaDs = process.env.NOTION_AGENDA_DS_ID;
    this.activeGoalsDs = process.env.NOTION_GOALS_DS_ID;
    this.weeklyGoalsDs = process.env.NOTION_WEEKLY_GOALS_DS_ID;
  }

   #handleError(method, error) {
    throw new Error(`NotionManager.${method} failed: ${error.message}`);
  }


  async getActiveGoals() {
    const response = await this.notionClient.dataSources.query({
      data_source_id: this.activeGoalsDs,
    });

    return response.results;
  }

  async getWeeklyGoals() {
    const response = await this.notionClient.dataSources.query({
      data_source_id: this.weeklyGoalsDs,
      filter: {
        property: "Week",
        select: {
          equals: getCurrentWeekLabel(),
        },
      },
    });
    return response.results;
  }

  async saveWeeklyGoals(goals = []) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const day = weekStart.toISOString().split("T")[0];

    try {
      let requests = goals.map((item) => {
        return this.notionClient.pages.create({
          parent: {
            data_source_id: this.weeklyGoalsDs,
          },
          properties: {
            Goal: {
              type: "title",
              title: [{ type: "text", text: { content: item.goal } }],
            },
            Track: {
              type: "select",
              select: {
                name: item.track,
              },
            },
            Priority: {
              type: "select",
              select: {
                name: item.priority,
              },
            },
            "Why This Week": {
              type: "rich_text",
              rich_text: [
                {
                  type: "text",
                  text: { content: item.why_this_week },
                },
              ],
            },
            "Success Criteria": {
              type: "rich_text",
              rich_text: [
                {
                  type: "text",
                  text: { content: item.success_criteria },
                },
              ],
            },
            Week: {
              type: "select",
              select: {
                name: getCurrentWeekLabel(),
              },
            },
            "Week Start": {
              type: "date",
              date: {
                start: day,
              },
            },
          },
        });
      });

      const ans = await Promise.all(requests);
      return ans;
    } catch (error) {
      this.#handleError("save weekly goals", error);
    }
  }

  async getDailyAgenda() {
    const date = new Date().toISOString().split("T")[0];
    const response = await this.notionClient.dataSources.query({
      data_source_id: this.dailyAgendaDs,
      filter: {
        property: "Date",
        date: { equals: date },
      },
    });
    return response.results;
  }

  async createDailyAgendaTask({ title, priority, track, notes = "" }) {
    const date = new Date().toISOString().split("T")[0];
    const response = await this.notionClient.pages.create({
      parent: { data_source_id: this.dailyAgendaDs },
      properties: {
        Task: { title: [{ type: "text", text: { content: title } }] },
        Priority: { select: { name: priority } },
        Track: { select: { name: track } },
        Done: { checkbox: false },
        Date: { date: { start: date } },
        Notes: { rich_text: [{ type: "text", text: { content: notes } }] },
      },
    });
    return response;
  }

  async markTaskDone(pageId) {
    const response = await this.notionClient.pages.update({
      page_id: pageId,
      properties: {
        Done: { checkbox: true },
      },
    });
    return response;
  }

  async getYesterdayPending() {
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const date = yesterday.toISOString().split("T")[0];

    const response = await this.notionClient.dataSources.query({
      data_source_id: this.dailyAgendaDs,
      filter: {
        and: [
          { property: "Date", date: { equals: date } },
          { property: "Done", checkbox: { equals: false } },
        ],
      },
    });
    return response.results;
  }
}

const Notion = new NotionManager();
export default Notion;
