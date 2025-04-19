import {
  ChatInputCommandInteraction,
  MessageFlags,
  EmbedBuilder,
} from "discord.js";
import { fetchTokenPrice } from "../utils/api";
import { TokenType, CommandOption } from "../utils/types";
import { config } from "../config";
import { CONSTANTS } from "../utils/constants";

export async function handlePriceCommand(
  interaction: ChatInputCommandInteraction
) {
  const tokenOption = interaction.options.get("token") as CommandOption;
  const token = tokenOption?.value as TokenType;

  if (!token) {
    console.warn(`Invalid token request from ${interaction.user.tag}`);
    await interaction.reply({
      content: "Please provide a valid token",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  console.log(`Fetching price for ${token}...`);

  try {
    const price = await fetchTokenPrice(token);

    if (price !== null) {
      const numericPrice = Number(price);
      if (isNaN(numericPrice)) {
        throw new Error("Invalid price format received");
      }
      const formattedPrice = numericPrice.toFixed(config.PRICE_DECIMAL_PLACES);
      console.log(`Successfully fetched ${token} price: $${formattedPrice}`);

      const embed = new EmbedBuilder()
        .setColor(CONSTANTS.COLORS.PRIMARY)
        .setTitle(`${token} Price`)
        .addFields({
          name: "Current Price",
          value: `\`$${formattedPrice}\``,
          inline: false,
        });

      await interaction.editReply({ embeds: [embed] });
    } else {
      console.error(`Failed to fetch price for ${token}`);
      await interaction.editReply({
        content: "Failed to fetch token price",
      });
    }
  } catch (error) {
    console.error(`Error in price command for ${token}:`, error);
    await interaction.editReply({
      content: "An error occurred while fetching the price",
    });
  }
}
