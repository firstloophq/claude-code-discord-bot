import type { Message, ThreadChannel } from "discord.js";
import { query } from "@anthropic-ai/claude-code";
import { customSystemPrompt } from "@/handlers/mentions/claude/system-prompt";
import logger from "@/logger";
import { getThreadContext } from "@/handlers/utils/threads";
import { extractMentionContent } from "@/handlers/mentions";
import env from "@/env";

/**
 * Handles a bot mention using Claude Code SDK.
 * Creates a new thread if the message with the mention is not in a thread.
 * Otherwise, responds to the thread.
 * @param params The parameters for the function.
 * @param params.message The message with the mention.
 * @param params.botId The ID of the bot.
 */
export async function handleClaudeMention({
    message,
    botId,
}: {
    message: Message;
    botId: string;
}) {
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
            name: `Claude: ${extractMentionContent(message, botId)}`,
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
                        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
                    },
                },
                "discord-linear": {
                    type: "stdio",
                    command: "bun",
                    args: ["run", "submodules/linear-mcp/build/index.js"],
                    env: {
                        LINEAR_API_KEY: env.LINEAR_API_KEY,
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
                "mcp__discord-linear__linear_auth",
                "mcp__discord-linear__linear_auth_callback",
                "mcp__discord-linear__linear_create_issue",
                "mcp__discord-linear__linear_create_project_with_issues",
                "mcp__discord-linear__linear_bulk_update_issues",
                "mcp__discord-linear__linear_search_issues",
                "mcp__discord-linear__linear_get_teams",
                "mcp__discord-linear__linear_get_user",
                "mcp__discord-linear__linear_delete_issue",
                "mcp__discord-linear__linear_delete_issues",
                "mcp__discord-linear__linear_get_project",
                "mcp__discord-linear__linear_search_projects",
                "mcp__discord-linear__linear_create_issues",
                "mcp__discord-linear__linear_get_issue_comments",
                "mcp__discord-linear__linear_create_comment",
                "mcp__discord-linear__linear_create_project_milestone",
                "mcp__discord-linear__linear_update_project_milestone",
                "mcp__discord-linear__linear_delete_project_milestone",
                "mcp__discord-linear__linear_get_project_milestone",
                "mcp__discord-linear__linear_search_project_milestones",
                "mcp__discord-linear__linear_get_project_milestones",
                "mcp__discord-linear__linear_create_project_milestones",
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
