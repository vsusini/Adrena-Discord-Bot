import { Client, SlashCommandBuilder, REST, Routes } from "discord.js";
import { handlePriceCommand } from "./price";
import { handleMutagenCommand } from "./mutagen";
import { handleRewardsCommand } from "./rewards";

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
  ].map((command) => command.toJSON());

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationCommands(client.application.id), {
      body: commands,
    });
    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error("Error registering commands:", error);
  }

  // Set up command handlers
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    console.log(
      `Price command used by ${interaction.user.tag} (${interaction.user.id})`
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
