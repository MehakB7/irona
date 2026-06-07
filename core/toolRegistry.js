import Notion from "../tools/notion.js"

export const toolRegistry = {
    async execute(tool_name, tool_input) {
        console.log("Tool called:", tool_name)
        switch(tool_name) {
            case "get_daily_agenda":
                return Notion.getDailyAgenda()

            case "create_daily_agenda_task":
                return Notion.createDailyAgendaTask(tool_input)

            case "mark_task_done":
                return Notion.markTaskDone(tool_input.page_id)

            default:
                throw new Error(`Unknown tool: ${tool_name}`)
        }
    }
}