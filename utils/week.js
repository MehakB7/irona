export function getCurrentWeekLabel() {
    const start = new Date(process.env.PLAN_START_DATE)
    const today = new Date()
    const daysDiff = Math.floor((today - start) / (1000 * 60 * 60 * 24))
    const weekNum = Math.ceil((daysDiff + 1) / 7)
    return `W${weekNum}`   // → "W3"
}


export function getDaysRemaining() {
    const end = new Date(process.env.PLAN_START_DATE)
    end.setDate(end.getDate() + 92)
    const today = new Date()
    return Math.ceil((end - today) / (1000 * 60 * 60 * 24))
}