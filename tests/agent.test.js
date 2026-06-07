import 'dotenv/config'
import { describe, test, expect } from 'vitest'  
import { Irona } from '../core/agent.js'
   const irona = new Irona();
describe('Irona Agent Loop', () => {
    test('generates daily agenda', async () => {
        const response = await irona.listen(`Generate my agenda for today`)
        expect(response).toBeTruthy()
        expect(typeof response).toBe('string')
        console.log('Irona response:', response)
    }, 30000) 
    test('handles unknown intent gracefully', async () => {
        const response = await irona.listen("what is the weather today")
        expect(response).toBeTruthy()
    }, 30000)
})
