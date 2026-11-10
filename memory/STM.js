import client from "./redisClient.js";
class STM {


    getSessionKey(chatId){
        const day = new Date().toISOString().split("T")[0];
        return `${chatId}:${day}`
    }


    async getHistory(chatId){

    }

   async saveTurnData(chatId, userMessage, assistantMessage){
        const key = this.getSessionKey(chatId);
        const userData = JSON.stringify({
            role: "user",
            content: userMessage,
        });

        const assistantData = JSON.stringify({
            role:"assistant",
            content: assistantMessage
        })
       
       let totalLength =  await client.rPush(key, userData, assistantData);
        await client.lTrim(key,-40,-1);

    }
}

export const ShortTermMemory = new STM();
