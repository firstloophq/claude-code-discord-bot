import type { ThreadChannel } from "discord.js";

/**
 * Get the full context of a Discord thread.
 * @param thread The thread to get the context of.
 * @returns The full context of the thread.
 */
export async function getThreadContext(thread: ThreadChannel): Promise<string> {
    // Fetch all messages in the thread
    const messages = await thread.messages.fetch({ limit: 100 });

    // Sort messages by timestamp (oldest first)
    const sortedMessages = Array.from(messages.values()).sort(
        (a, b) => a.createdTimestamp - b.createdTimestamp
    );

    // Format messages for context
    const context = sortedMessages
        .map((msg) => {
            const author = msg.author.bot
                ? `${msg.author.username} (bot)`
                : msg.author.username;
            return `${author}: ${msg.content}`;
        })
        .join("\n");

    return context;
}
