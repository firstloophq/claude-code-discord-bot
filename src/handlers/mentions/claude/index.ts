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
                    command: "bunx",
                    args: ["-y", "@tacticlaunch/mcp-linear"],
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
                "mcp__discord-linear__linear_getViewer",
                "mcp__discord-linear__linear_getOrganization",
                "mcp__discord-linear__linear_getUsers",
                "mcp__discord-linear__linear_getLabels",
                "mcp__discord-linear__linear_getTeams",
                "mcp__discord-linear__linear_getProjects",
                "mcp__discord-linear__linear_createProject",
                "mcp__discord-linear__linear_getIssues",
                "mcp__discord-linear__linear_getIssueById",
                "mcp__discord-linear__linear_searchIssues",
                "mcp__discord-linear__linear_createIssue",
                "mcp__discord-linear__linear_updateIssue",
                "mcp__discord-linear__linear_createComment",
                "mcp__discord-linear__linear_addIssueLabels",
                "mcp__discord-linear__linear_removeIssueLabels",
                "mcp__discord-linear__linear_assignIssue",
                "mcp__discord-linear__linear_subscribeToIssue",
                "mcp__discord-linear__linear_convertIssueToSubtask",
                "mcp__discord-linear__linear_createIssueRelation",
                "mcp__discord-linear__linear_archiveIssue",
                "mcp__discord-linear__linear_setIssuePriority",
                "mcp__discord-linear__linear_transferIssue",
                "mcp__discord-linear__linear_duplicateIssue",
                "mcp__discord-linear__linear_getIssueHistory",
                "mcp__discord-linear__linear_getComments",
                "mcp__discord-linear__linear_updateProject",
                "mcp__discord-linear__linear_addIssueToProject",
                "mcp__discord-linear__linear_getProjectIssues",
                "mcp__discord-linear__linear_getCycles",
                "mcp__discord-linear__linear_getActiveCycle",
                "mcp__discord-linear__linear_addIssueToCycle",
                "mcp__discord-linear__linear_getInitiatives",
                "mcp__discord-linear__linear_getInitiativeById",
                "mcp__discord-linear__linear_createInitiative",
                "mcp__discord-linear__linear_updateInitiative",
                "mcp__discord-linear__linear_archiveInitiative",
                "mcp__discord-linear__linear_unarchiveInitiative",
                "mcp__discord-linear__linear_deleteInitiative",
                "mcp__discord-linear__linear_getInitiativeProjects",
                "mcp__discord-linear__linear_addProjectToInitiative",
                "mcp__discord-linear__linear_removeProjectFromInitiative",
                "mcp__discord-linear__linear_getWorkflowStates",
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
