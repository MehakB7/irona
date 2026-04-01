import { Client } from "@notionhq/client";
class NotionManager {
  constructor() {
    this.notionClient = new Client({
      auth: process.env.NOTION_TOKEN,
    });
    this.meetingDbId = process.env.NOTION_DATABASE_ID;
  }

  async createMeetingNote({ title, date, attendees, summary, actionItems, meetingType }) {
    const response = await this.notionClient.pages.create({
        parent: { database_id: this.meetingDbId },
        properties: {
            title: {title:[{text:{content:title}}]},
            date:{date: {start:date}},
            attendees: attendees.map(item=>({name:item})),
            summary:{rich_text:[{text:{content:summary}}]},
            actionItems:{rich_text:[{text:{content:actionItems}}]},
            meetingType:{select:{name:meetingType}}

        }
    });
    return response;
}
  async getTodaysNotes() {}
  async getDailyLog() {}
}
