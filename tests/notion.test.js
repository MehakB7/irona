import 'dotenv/config'
import { describe, test, expect, beforeAll } from 'vitest'
import Notion from '../tools/notion.js'

describe('Notion', () => {
    let pageId

    beforeAll(() => {
        expect(process.env.NOTION_TOKEN, 'NOTION_TOKEN must be set').toBeTruthy()
    })

    test('createDailyAgendaTask — creates a task and returns an id', async () => {
        const task = await Notion.createDailyAgendaTask({
            title: 'Solve 3 heap problems on LeetCode',
            priority: 'High',
            track: 'DSA',
            notes: 'This is a good work',
        })

        expect(task).toBeDefined()
        expect(task.id).toBeTypeOf('string')
        expect(task.id.length).toBeGreaterThan(0)

        pageId = task.id
    })

    test('getDailyAgenda — returns an array of today\'s tasks', async () => {
        const agenda = await Notion.getDailyAgenda()

        expect(Array.isArray(agenda)).toBe(true)
        expect(agenda.length).toBeGreaterThan(0)
    })

    test('markTaskDone — marks the created task as done', async () => {
        expect(pageId, 'pageId must be set by createDailyAgendaTask test').toBeTruthy()

        const result = await Notion.markTaskDone(pageId)
        expect(result).toBeDefined()
    })
})
