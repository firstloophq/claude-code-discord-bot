import type { Command } from "./types";
import { triggerGitHubAction } from "./github";
import logger from "../../logger";

/**
 * The commands for the Discord bot.
 */
const commands: Command[] = [
    {
        name: "update-wiki",
        description: "Update the wiki with the latest discussions",
        execute: async (interaction) => {
            await interaction.deferReply();

            try {
                await triggerGitHubAction(
                    "firstloophq",
                    "wiki-public",
                    "update-wiki.yml",
                    "main"
                );

                await interaction.editReply({
                    content: `✅ Wiki update workflow triggered successfully! See https://github.com/firstloophq/wiki-public/actions/workflows/update-wiki.yml for the status.`,
                });
            } catch (error) {
                logger.error("Error triggering GitHub action:", error);
                await interaction.editReply({
                    content: `❌ Failed to trigger wiki update: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`,
                });
            }
        },
    },
];

export default commands;
