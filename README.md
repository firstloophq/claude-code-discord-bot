# Firstloop Discord Bot

A Discord.js bot server for Firstloop that handles slash commands and GitHub integrations.

**Discord Application**: https://discord.com/developers/applications/1408139346749685811

## Setup

### Prerequisites
- [Bun](https://bun.sh) runtime
- Discord bot token
- GitHub personal access token (for GitHub integrations)

### Installation

1. Install dependencies:
```bash
bun install
```

2. Create a `.env` file with required environment variables:
```bash
cp .env.example .env
```

Required environment variables:
- `DISCORD_TOKEN` - Your Discord bot token
- `CLIENT_ID` - Your Discord application client ID
- `GITHUB_TOKEN` - GitHub personal access token (for GitHub Actions integration)

### Running the Bot

```bash
bun run src/server.ts
```

The bot will automatically deploy slash commands when it starts.

## Adding New Commands

### 1. Create Command File

Create a new command in `src/commands/`:

```typescript
// src/commands/my-command.ts
import type { Command } from "./types";

const myCommand: Command = {
    name: "my-command",
    description: "Description of what this command does",
    execute: async (interaction) => {
        await interaction.reply("Hello from my command!");
    },
};

export default myCommand;
```

### 2. Add to Command Index

Add your command to `src/commands/index.ts`:

```typescript
import myCommand from "./my-command";

const commands: Command[] = [
    // ... existing commands
    myCommand,
];
```

### 3. Deploy and Test

1. **Start the bot** - Commands auto-deploy when running:
   ```bash
   bun run src/server.ts
   ```

2. **Test in Discord** - The command will be available as a slash command (`/my-command`)

### 4. Discord Server Configuration

#### Command Permissions
1. Go to your Discord server settings
2. Navigate to **Integrations** → **Firstloop Bot**
3. Configure command permissions:
   - Set which roles/users can use specific commands
   - Enable/disable commands per channel

#### Channel Restrictions
- Commands can be restricted to specific channels via Discord's integration settings
- Use **Integrations** → **Firstloop Bot** → **Manage** to configure channel permissions
- Consider creating dedicated bot channels for certain commands

## Command Structure

Commands must implement the `Command` interface:

```typescript
interface Command {
  name: string;
  description: string;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
```

## Available Commands

- `/update-wiki` - Triggers GitHub Actions workflow to update the wiki

## Development

### Error Handling
- All commands include automatic error handling
- Errors are logged to console and shown to users as ephemeral messages

### GitHub Integration
- Uses GitHub REST API v2022-11-28
- Supports workflow dispatch events
- Requires `GITHUB_TOKEN` environment variable

### Logging
- Uses Winston for structured logging
- Logs include interaction details and error context
