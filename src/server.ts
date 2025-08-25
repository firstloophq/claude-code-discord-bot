import { Client, Events, GatewayIntentBits } from "discord.js";
import { deployCommands } from "./handlers/commands/deploy";
import commands from "./handlers/commands";
import logger from "./logger";
import { handleMention, isBotMentioned } from "./handlers/mentions";

// Start by deploying the commands to the Discord API.
await deployCommands();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once(Events.ClientReady, (readyClient) => {
    logger.info(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;
    try {
        const command = commands.find((c) => c.name === commandName);
        if (!command) {
            await interaction.reply({
                content: "Command not found!",
                ephemeral: true,
            });
            return;
        }
        await command.execute(interaction);
    } catch (error) {
        logger.error("Error handling interaction:", error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true,
            });
        }
    }
});

client.on(Events.MessageCreate, async (message) => {
    // Ignore messages from bots
    if (message.author.bot) return;

    // Check if the bot is mentioned
    if (client.user && isBotMentioned(message, client.user.id)) {
        try {
            await handleMention(message);
        } catch (error) {
            logger.error("Error handling mention:", error);
            try {
                await message.reply(
                    "Sorry, I encountered an error while processing your mention."
                );
            } catch (replyError) {
                logger.error("Failed to send error message:", replyError);
            }
        }
    }
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
    logger.error("DISCORD_TOKEN environment variable is required");
    process.exit(1);
}

client.on(Events.Error, (error) => {
    logger.error("Client error:", error);
});

process.on("unhandledRejection", (error) => {
    logger.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception:", error);
    process.exit(1);
});

client.login(token).catch(logger.error);
