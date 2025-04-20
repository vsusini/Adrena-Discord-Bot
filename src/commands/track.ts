import { SlashCommandBuilder } from "@discordjs/builders";
import {
  ChatInputCommandInteraction,
  MessageFlags,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ComponentType,
} from "discord.js";
import { fetchPositions } from "../utils/api";
import { formatters } from "../utils/formatters";
import { PositionTracker } from "../services/positionTracker";

export const data = new SlashCommandBuilder()
  .setName("track")
  .setDescription("Track a trader's position")
  .addStringOption((option) =>
    option
      .setName("wallet")
      .setDescription("Trader's wallet address")
      .setRequired(true)
  );

export function formatEntryPrice(price: number, symbol: string): string {
  if (symbol.toUpperCase() === "BONK") {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 8,
      maximumFractionDigits: 8,
    });
  }
  return formatters.usdValue(price.toString());
}

export async function handleTrackCommand(
  interaction: ChatInputCommandInteraction
) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const wallet = interaction.options.getString("wallet", true);
    const positions = await fetchPositions(wallet);

    if (!positions.length) {
      await interaction.editReply("No open positions found for this wallet.");
      return;
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("select_position")
      .setPlaceholder("Select a position to track")
      .addOptions(
        positions.map((pos) => ({
          label: `${pos.symbol} - ${pos.side.toUpperCase()}`,
          description: `Entry: $${formatEntryPrice(
            pos.entry_price,
            pos.symbol
          )} | Leverage: ${pos.entry_leverage}x`,
          value: `${pos.position_id}:${wallet}:${pos.symbol}:${pos.side}:${pos.entry_price}:${pos.entry_leverage}`,
        }))
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      selectMenu
    );

    const response = await interaction.editReply({
      content: "Select a position to track:",
      components: [row],
    });

    // Create collector for the select menu interaction
    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000, // 60 seconds timeout
      max: 1, // Only collect one selection
    });

    collector.on("collect", async (selectInteraction) => {
      const [id, wallet, symbol, side, entry_price, entry_leverage] =
        selectInteraction.values[0].split(":");
      const tracker = PositionTracker.getInstance();

      const success = tracker.addPosition(
        parseInt(id),
        wallet,
        interaction.user.id,
        symbol,
        side,
        parseFloat(entry_price),
        parseFloat(entry_leverage)
      );

      await selectInteraction.reply({
        content: success
          ? `Now tracking ${symbol} ${side.toUpperCase()} position with Entry: $${formatEntryPrice(
              parseFloat(entry_price),
              symbol
            )}`
          : `You are already tracking this position`,
        ephemeral: true,
      });

      // Remove the select menu after selection
      await interaction.editReply({
        content: "Position selected for tracking.",
        components: [],
      });
    });

    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        await interaction.editReply({
          content: "No position selected. Selection timed out.",
          components: [],
        });
      }
    });
  } catch (error) {
    console.error("Error in track command:", error);
    await interaction.editReply("Error fetching positions. Try again later.");
  }
}
