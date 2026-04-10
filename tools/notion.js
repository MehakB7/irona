import { Client } from "@notionhq/client";
import { getCurrentWeekLabel } from "../utils/week.js";
class NotionManager {
  constructor() {
    this.notionClient = new Client({
      auth: process.env.NOTION_TOKEN,
    });
    this.goaldb = process.env.NOTION_GOALS_DB_ID;
    this.retrodb = process.env.NOTION_RETRO_DB_ID;
    this.dailyAgendadb = process.env.NOTION_AGENDA_DB_ID;
    this.weeklygoaldb = process.env.NOTION_WEEKLY_GOALS_DB_ID;
  }

  #handleError(method, error) {
    throw new Error(`NotionManager.${method} failed: ${error.message}`);
  }

  async getActiveGoals() {
    try {
      const response = await this.notionClient.dataSources.query({
        data_source_id: this.goaldb,
      });

      return response.results;
    } catch (error) {
      this.#handleError("Get Active Goals", error);
    }
  }

  async getThisWeekGoals() {
    try {
      const response = await this.notionClient.dataSources.query({
        data_source_id: this.weeklygoaldb,
        filter: {
          property: "Week",
          select: {
            equals: getCurrentWeekLabel(),
          },
        },
      });

      return response.results;
    } catch (error) {
      this.#handleError("get this week goals", error);
    }
  }

  async getLastRetro() {
    try {
      const response = await this.notionClient.dataSources.query({
        data_source_id: this.retroDsId,
        sorts: [{ property: "Date", direction: "descending" }],
        page_size: 1,
      });
      return response.results[0] ?? null;
    } catch (e) {
      this.#handleError("get last retro", error);
    }
  }

  async getDailyAgenda() {
    try {
      const date = new Date().toISOString().split("T")[0];
      const response = await this.notionClient.dataSources.query({
        data_source_id: this.dailyAgendadb,

        filter: {
          property: "Date",
          date: {
            equals: date,
          },
        },
      });

      return response.results;
    } catch (error) {
      this.#handleError("get daily agenda", error);
    }
  }

  async getYesterdayPending() {
    let yesterday = new Date();
    yesterday.setDate(new Date().getDate() - 1);
    let date = yesterday.toISOString().split("T")[0];
    try {
      const response = await this.notionClient.dataSources.query({
        data_source_id: this.dailyAgendadb,
        filter: {
          and: [
            {
              property: "Date",
              date: {
                equals: date,
              },
            },
            {
              property: "Done",
              checkbox: { equals: false },
            },
          ],
        },
      });

      return response.results;
    } catch (error) {
      this.#handleError("get yesterday pending", error);
    }
  }

  async createDailyAgendaTask({ title, priority, track, notes }) {
    const date = new Date().toISOString().split("T")[0];

    try {
      const response = await this.notionClient.pages.create({
        parent: {
          data_source_id: this.dailyAgendadb,
        },
        properties: {
          Task: {
            type: "title",
            title: [{ type: "text", text: { content: title } }],
          },
          Priority: {
            type: "select",
            select: { name: priority },
          },
          Done: {
            checkbox: false,
          },
          Date: {
            type: "date",
            date: {
              start: date,
            },
          },
          Track: {
            select: { name: track }, // ← was missing
          },
          Notes: {
            rich_text: [{ type: "text", text: { content: notes } }], // ← was missing
          },
        },
      });

      return response;
    } catch (err) {
      this.#handleError("Create daily agenda task", err);
    }
  }

  async markTaskDone(pageId) {
    try {
      const response = await this.notionClient.pages.update({
        page_id: pageId,
        properties: {
          Done: {
            checkbox: true,
          },
        },
      });

      return response;
    } catch (error) {
      this.#handleError("mark task done", error);
    }
  }

  async saveWeeklyRetro({
    aiAgnet,
    completionRate,
    dSADone,
    healthDone,
    jobApplicationDone,
    systemDesignDone,
    whatWork,
    whatNotWork,
    statergyChange,
    nextWeekFocus,
  }) {
    const date = new Date().toISOString().split("T")[0];
    try {
      const response = await this.notionClient.pages.create({
        parent: {
          data_source_id: this.retrodb,
        },
        properties: {
          Week: {
            type: "title",
            title: [
              {
                type: "text",
                text: { content: getCurrentWeekLabel() },
              },
            ],
          },
          "AI Agents Done": {
            number: aiAgnet,
          },
          "Completion Rate": {
            number: completionRate,
          },
          "DSA Done": {
            number: dSADone,
          },
          "Health Done": {
            number: healthDone,
          },
          "Job Apps Done": {
            number: jobApplicationDone,
          },
          "System Design Done": {
            number: systemDesignDone,
          },
          "What Worked": {
            type: "rich_text",
            rich_text: [
              {
                type: "text",
                text: { content: whatWork },
              },
            ],
          },
          "What Didnt Work": {
            type: "rich_text",
            rich_text: [
              {
                type: "text",
                text: { content: whatNotWork },
              },
            ],
          },
          "Strategy Change": {
            type: "rich_text",
            rich_text: [
              {
                type: "text",
                text: { content: statergyChange },
              },
            ],
          },
          "Next Week Focus": {
            type: "rich_text",
            rich_text: [
              {
                type: "text",
                text: { content: nextWeekFocus },
              },
            ],
          },
          Date: {
            type: "date",
            date: {
              start: date,
            },
          },
        },
      });

      return response;
    } catch (error) {
      this.#handleError("Save weekly retro", error);
    }
  }

  async saveWeeklyGoals(goals = []) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const day = weekStart.toISOString().split("T")[0];

    try {
      let requests = goals.map((item) => {
        return this.notionClient.pages.create({
          parent: {
            data_source_id: this.weeklygoaldb,
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
                  text: { content: item.whyThisWeek },
                },
              ],
            },
            "Success Criteria": {
              type: "rich_text",
              rich_text: [
                {
                  type: "text",
                  text: { content: item.successCriteria },
                },
              ],
            },
            Week: {
              type: "select",
              select: {
                name: item.week,
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
}

const Notion = new NotionManager();
export default Notion;
