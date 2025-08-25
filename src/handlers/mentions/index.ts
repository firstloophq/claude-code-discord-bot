import type { Message } from "discord.js";
import logger from "@/logger";

/**
 * Check if the bot is mentioned in the message
 * @param message The message to check
 * @param botId The bot's user ID
 * @returns True if the bot is mentioned in the message, false otherwise
 */
export function isBotMentioned(message: Message, botId: string): boolean {
    logger.info(`Checking if bot is mentioned in message: ${message.content}`);
    logger.info(
        `Bot ID: ${botId}, Mentioned users: ${JSON.stringify(
            message.mentions.users
        )}`
    );
    return message.mentions.users.has(botId);
}

/**
 * Extract the content after the bot mention
 * @param message The message containing the mention
 * @param botId The bot's user ID
 * @returns The content after the bot mention
 */
export function extractMentionContent(message: Message, botId: string): string {
    // Remove the bot mention from the message content
    const mentionRegex = new RegExp(`<@!?${botId}>`, "g");
    return message.content.replace(mentionRegex, "").trim();
}
