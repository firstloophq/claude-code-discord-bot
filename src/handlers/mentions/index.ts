import type { Message } from "discord.js";
import logger from "../../logger";
import { handleClaudeMention } from "./claude";

/**
 * Handle when the bot is mentioned in a message
 * @param message The message containing the mention
 */
export async function handleMention(message: Message): Promise<void> {
    // TODO: Implement mention response logic
    logger.info(
        `Bot mentioned by ${message.author.tag} in ${
            message.guild?.name || "DM"
        }`
    );

    await handleClaudeMention(message);
}

/**
 * Check if the bot is mentioned in the message
 * @param message The message to check
 * @param botId The bot's user ID
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
 */
export function extractMentionContent(message: Message, botId: string): string {
    // Remove the bot mention from the message content
    const mentionRegex = new RegExp(`<@!?${botId}>`, "g");
    return message.content.replace(mentionRegex, "").trim();
}
