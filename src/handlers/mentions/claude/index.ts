import type { Message, ThreadChannel } from "discord.js";
import { query } from "@anthropic-ai/claude-code";
import { customSystemPrompt } from "./system-prompt";
import logger from "../../../logger";
import { getThreadContext } from "../../utils/threads";

/**
 * Handles a bot mention using Claude Code SDK.
 * Creates a new thread if the message with the mention is not in a thread.
 * Otherwise, responds to the thread.
 * @param message The message with the mention.
 */
export async function handleClaudeMention(message: Message) {
    let thread: ThreadChannel;
    let prompt = message.content;

    // Check if the message is already in a thread
    if (message.channel.isThread()) {
        thread = message.channel;

        // Get full thread context
        const threadContext = await getThreadContext(thread);

        // Prepend thread context to the prompt
        prompt = `Previous conversation in this thread:\n${threadContext}\n\nLatest message:\n${message.content}`;

        logger.info(`Including thread context in prompt`);
    } else {
        // Create a new thread from the message
        thread = await message.startThread({
            name: message.content.slice(0, 100),
        });
    }

    for await (const ccMessage of query({
        prompt,
        options: {
            customSystemPrompt,
            mcpServers: {
                "discord-github": {
                    type: "http",
                    url: "https://api.githubcopilot.com/mcp/",
                    headers: {
                        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    },
                },
            },
            allowedTools: [
                "mcp__discord-github__get_commit",
                "mcp__discord-github__get_file_contents",
                "mcp__discord-github__get_me",
                "mcp__discord-github__list_commits",
                "mcp__discord-github__search_code",
                "mcp__discord-github__search_repositories",
            ],
        },
    })) {
        logger.info(`Claude message: ${JSON.stringify(ccMessage)}`);
        if (ccMessage.type === "assistant") {
            for (const part of ccMessage.message.content) {
                if (part.type === "text") {
                    for (let i = 0; i < part.text.length; i += 1900) {
                        await thread.send(part.text.slice(i, i + 1900));
                    }
                }
            }
        }
    }
}
