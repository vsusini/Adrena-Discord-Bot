import { config as dotenvConfig } from "dotenv";
import { DiscordBot } from "./client";

async function main() {
  // Load environment variables
  dotenvConfig();

  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    throw new Error("DISCORD_TOKEN is not set in environment variables");
  }

  try {
    const bot = new DiscordBot();
    await bot.start(token);
  } catch (error) {
    console.error("Failed to start bot:", error);
    process.exit(1);
  }
}

main().catch(console.error);
