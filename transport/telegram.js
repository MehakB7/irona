import TelegramBot from "node-telegram-bot-api";
import {Irona} from "../core/agent.js";

const irona = new Irona();

export const startIrona = async () => {
  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: true,
  });
  const allowed_chat = process.env.TELEGRAM_CHAT_ID;

  bot.on("message", async (message) => {
    let chatId = message.chat.id.toString();

    if (chatId !== allowed_chat) {
      bot.sendMessage(chatId, "Unauthorized.");
      return;
    }

    const userMessage = message.text;
    bot.sendChatAction(chatId, "typing");

    try {
      const response = await irona.listen(userMessage);

      bot.sendMessage(chatId, response, { parse_mode: "Markdown" });
    } catch (e) {
      console.log("Error while retriveing data", e);

      bot.sendMessage(chatId, "❌ Something went wrong. Check the logs.");
    }
  });

  bot.on("polling_error", (err) => {
        console.error("Polling error:", err.message)
    })
};
