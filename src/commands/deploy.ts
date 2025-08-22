import { SlashCommandBuilder, REST, Routes } from "discord.js";
import commands from ".";
import logger from "../logger";

const commandsToDeploy = commands
    .map((command) =>
        new SlashCommandBuilder()
            .setName(command.name)
            .setDescription(command.description)
    )
    .map((command) => command.toJSON());

const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

/**
 * Deploy the latest slash commands for the Discord bot.
 */
export async function deployCommands() {
    try {
        logger.info(
            `Started refreshing ${commandsToDeploy.length} application (/) commands.`
        );

        const data = (await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID!),
            { body: commandsToDeploy }
        )) as any[];

        logger.info(
            `Successfully reloaded ${data.length} application (/) commands.`
        );
    } catch (error) {
        logger.error("Error deploying commands:", error);
    }
}
