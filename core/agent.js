import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "../config/constant";
import { toolRegistry } from "./toolRegistry";
import { tools } from "../config/tools";
export class Irona {
  messages = [];
  tools = [];
  maxTurns = 10;
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.tools = tools;
  }

  async listen(message) {

    let turn = this.maxTurns;
    this.messages = [{ role: "user", content: message }];
    let response = await this.client.messages.create({
      model: "claude-haiku-4-5-20251001",
      tools: this.tools,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: this.messages,
    });

    while (response.stop_reason != "end_turn" && turn > 0) {
      turn--;
      const toolUseBlocks = response.content.filter(
        (block) => block.type === "tool_use",
      );

      const toolResults = await Promise.all(
        toolUseBlocks.map(async (tool) => {
          const result = await toolRegistry.execute(tool.name, tool.input);
          return {
            type: "tool_result",
            tool_use_id: tool.id,
            content: JSON.stringify(result),
          };
        }),
      );

      this.messages.push(
        { role: "assistant", content: response.content },
        { role: "user", content: toolResults },
      );

      response = await  this.client.messages.create({
        model: "claude-haiku-4-5-20251001",
        system: SYSTEM_PROMPT,
        max_tokens: 1024,
        tools: this.tools,
        messages: this.messages,
      });
    }

    const finalText = response.content.find(
      (block) => block.type === "text",
    )?.text;

    return finalText;
  }
}
