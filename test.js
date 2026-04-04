// test.js
import 'dotenv/config'
import Notion from './tools/notion.js'

async function test() {

    console.log("\n--- 1. createDailyAgendaTask ---")
    const task = await Notion.createDailyAgendaTask({
        title: "Solve 3 heap problems on LeetCode",
        priority: "High",
        track: "DSA",
        notes: "This is a good work",

    })
    console.log("created task id:", task.id)

    // save this id — you'll need it for markTaskDone
    const pageId = task.id

    console.log("\n--- 2. getDailyAgenda ---")
    const agenda = await Notion.getDailyAgenda()
    console.log("today's tasks:", agenda.length)

    console.log("\n--- 3. markTaskDone ---")
    await Notion.markTaskDone(pageId)
    console.log("marked done:", pageId)

    console.log("\n--- 4. getYesterdayPending ---")
    const pending = await Notion.getYesterdayPending()
    console.log("yesterday pending:", pending.results?.length ?? 0)

    console.log("\n--- 5. getActiveGoals ---")
    const goals = await Notion.getActiveGoals()
    console.log("active goals:", goals.length)

    console.log("\n--- 6. getThisWeekGoals ---")
    const weekGoals = await Notion.getThisWeekGoals()
    console.log("this week goals:", weekGoals.length)
    // will be 0 until saveWeeklyGoals runs — that's expected

    console.log("\n--- 7. saveWeeklyGoals ---")
    const saved = await Notion.saveWeeklyGoals([
        {
            goal: "Solve 5 heap problems, implement MinHeap from scratch",
            track: "DSA",
            priority: "High",
            week: "W3",
            whyThisWeek: "Heaps are the pattern gap from last week",
            successCriteria: "Can implement MinHeap blindly + solve 5 problems"
        },
        {
            goal: "Send 2 job applications to Supabase and Whereby",
            track: "Job Apps",
            priority: "High",
            week: "W3",
            whyThisWeek: "0 apps sent in 20 days — this is the critical gap",
            successCriteria: "2 applications submitted with tailored cover note"
        },
        {
            goal: "Run 4x this week, gym 5x",
            track: "Health",
            priority: "Medium",
            week: "W3",
            whyThisWeek: "Consistency building toward 10kg loss goal",
            successCriteria: "4 runs logged in agenda as done"
        }
    ])
    console.log("weekly goals saved:", saved.length)

    console.log("\n--- 8. saveWeeklyRetro ---")
    await Notion.saveWeeklyRetro({
        aiAgnet: 5,
        completionRate: 68,
        dSADone: 6,
        healthDone: 6,
        jobApplicationDone: 0,
        systemDesignDone: 4,
        whatWork: "Morning DSA sessions worked great, gym consistency solid",
        whatNotWork: "Zero job applications sent — avoidance pattern clear",
        statergyChange: "Block 30 mins every Tuesday specifically for job apps",
        nextWeekFocus: "Job Apps is the priority — everything else is secondary"
    })
    console.log("retro saved ✅")

    console.log("\n✅ All tests passed!")
}

test().catch(console.error)