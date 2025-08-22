import type { ChatInputCommandInteraction } from "discord.js";

/**
 * A command that can be executed by the bot.
 */
export interface Command {
    /**
     * The name of the slash command.
     */
    name: string;
    /**
     * The description of the slash command.
     */
    description: string;
    /**
     * The function that will be executed when the slash command is called.
     */
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
