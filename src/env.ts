import { z } from "zod";

// Schema for parsing environment variables.
const envSchema = z.object({
    DISCORD_TOKEN: z.string(),
    CLIENT_ID: z.string(),
    GITHUB_TOKEN: z.string(),
    LINEAR_API_KEY: z.string(),
});

// Parse the environment variables according to above schema.
// eslint-disable-next-line n/no-process-env
export default envSchema.parse(process.env);
