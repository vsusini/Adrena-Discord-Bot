import { Client, SlashCommandBuilder, REST, Routes } from "discord.js";
import { handlePriceCommand } from "./price";
import { handleMutagenCommand } from "./mutagen";
import { handleRewardsCommand } from "./rewards";
import { handleTrackCommand } from "./track";
import { handleStatusCommand } from "./status";
import { handleUntrackCommand } from "./untrack";
import { config } from "../config";
import { 
    ChatInputCommandInteraction, 
    MessageFlags, 
    StringSelectMenuBuilder,
    ActionRowBuilder,
    ComponentType,
    Events
} from 'discord.js';

export async function setupCommands(client: Client) {
  if (!client.application) {
    throw new Error("Client application is not ready");
  }

  console.log("Setting up commands...");

  const commands = [
    new SlashCommandBuilder()
      .setName("price")
      .setDescription("Get the current price of a token")
      .addStringOption((option) =>
        option
          .setName("token")
          .setDescription("The token to check (ADX or ALP)")
          .setRequired(true)
          .addChoices(
            { name: "ADX", value: "ADX" },
            { name: "ALP", value: "ALP" }
          )
      ),
    new SlashCommandBuilder()
      .setName("mutagen")
      .setDescription("Get mutagen points and rank for a wallet")
      .addStringOption((option) =>
        option
          .setName("wallet")
          .setDescription("The wallet address to check")
          .setRequired(true)
      ),
    new SlashCommandBuilder()
      .setName("rewards")
      .setDescription("Check pending USDC rewards in the staking pool"),
    new SlashCommandBuilder()
      .setName("track")
      .setDescription("Track a trader's position")
      .addStringOption((option) =>
        option
          .setName("wallet")
          .setDescription("Trader's wallet address")
          .setRequired(true)
      ),
    new SlashCommandBuilder()
      .setName("status")
      .setDescription("Check your tracked positions"),
    new SlashCommandBuilder()
      .setName("untrack")
      .setDescription("Stop tracking a position"),
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
    commands.forEach(cmd => {
      console.log(`- /${cmd.name}: ${cmd.description}`);
    });
  } catch (error) {
    console.error("Error registering commands:", error);
  }

  // Set up command handlers
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    console.log(
      `${commandName} command used by ${interaction.user.tag} (${interaction.user.id})`
    );

    try {
      switch (commandName) {
        case "price":
          await handlePriceCommand(interaction);
          break;
        case "mutagen":
          await handleMutagenCommand(interaction);
          break;
        case "rewards":
          await handleRewardsCommand(interaction);
          break;
        case "track":
          await handleTrackCommand(interaction);
          break;
        case "status":
          await handleStatusCommand(interaction);
          break;
        case "untrack":
          await handleUntrackCommand(interaction);
          break;
        default:
          await interaction.reply({
            content: "Unknown command",
            ephemeral: true,
          });
      }
    } catch (error) {
      console.error(`Error handling command ${commandName}:`, error);
      await interaction.reply({
        content: "There was an error executing this command!",
        ephemeral: true,
      });
    }
  });

  console.log("Commands setup completed");
}
