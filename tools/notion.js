import { Client } from "@notionhq/client"

class NotionManager {
    constructor() {
        this.notionClient = new Client({ auth: process.env.NOTION_TOKEN })
        this.dailyAgendaDs = process.env.NOTION_AGENDA_DB_ID
    }

    async getDailyAgenda() {
        const date = new Date().toISOString().split("T")[0]
        const response = await this.notionClient.dataSources.query({
            data_source_id: this.dailyAgendaDs,
            filter: {
                property: "Date",
                date: { equals: date }
            }
        })
        return response.results
    }

    async createDailyAgendaTask({ title, priority, track, notes = "" }) {
        const date = new Date().toISOString().split("T")[0]
        const response = await this.notionClient.pages.create({
            parent: { data_source_id: this.dailyAgendaDs },
            properties: {
                "Task": { title: [{ type: "text", text: { content: title } }] },
                "Priority": { select: { name: priority } },
                "Track": { select: { name: track } },
                "Done": { checkbox: false },
                "Date": { date: { start: date } },
                "Notes": { rich_text: [{ type: "text", text: { content: notes } }] }
            }
        })
        return response
    }

    async markTaskDone(pageId) {
        const response = await this.notionClient.pages.update({
            page_id: pageId,
            properties: {
                "Done": { checkbox: true }
            }
        })
        return response
    }
}

const Notion = new NotionManager()
export default Notion