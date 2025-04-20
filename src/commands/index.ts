import { Client, REST, Routes, MessageFlags } from "discord.js";
import * as price from "./price";
import * as mutagen from "./mutagen";
import * as rewards from "./rewards";
import * as track from "./track";
import * as status from "./status";
import * as untrack from "./untrack";

export async function setupCommands(client: Client) {
  if (!client.application) {
    throw new Error("Client application is not ready");
  }

  console.log("Setting up commands...");

  const commands = [
    price.command,
    mutagen.command,
    rewards.command,
    track.command,
    status.command,
    untrack.command,
  ].map((command) => command.toJSON());

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

  try {
    console.log("Started refreshing application (/) commands.");
    // Global commands (can take up to 1 hour)
    // Routes.applicationGuildCommands(client.application.id, config.DEFAULT_GUILD_ID)
    await rest.put(Routes.applicationCommands(client.application.id), {
      body: commands,
    });
    console.log("Successfully reloaded application (/) commands:");
    commands.forEach((cmd) => {
      console.log(`- /${cmd.name}: ${cmd.description}`);
    });
  } catch (error) {
    console.error("Error registering commands:", error);
  }

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;
    console.log(
      `${commandName} command used by ${interaction.user.tag} (${interaction.user.id})`
    );

    try {
      switch (commandName) {
        case "price":
          await price.handlePriceCommand(interaction);
          break;
        case "mutagen":
          await mutagen.handleMutagenCommand(interaction);
          break;
        case "rewards":
          await rewards.handleRewardsCommand(interaction);
          break;
        case "track":
          await track.handleTrackCommand(interaction);
          break;
        case "status":
          await status.handleStatusCommand(interaction);
          break;
        case "untrack":
          await untrack.handleUntrackCommand(interaction);
          break;
        default:
          await interaction.reply({
            content: "Unknown command",
            flags: MessageFlags.Ephemeral,
          });
      }
    } catch (error) {
      console.error(`Error handling command ${commandName}:`, error);
      await interaction.reply({
        content: "There was an error executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    }
  });

  console.log("Commands setup completed");
}
