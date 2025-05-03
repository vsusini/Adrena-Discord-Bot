import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageFlags,
    SlashCommandBuilder,
  } from "discord.js";
  import { CONSTANTS } from "../utils/constants";
  import { formatters } from "../utils/formatters";
  
  export const command = new SlashCommandBuilder()
    .setName("tip")
    .setDescription("Support the bot by sending a tip!");
  
  export async function handleTipCommand(interaction: ChatInputCommandInteraction) {
    const tipAddress = "9ym576d9RkbVPdTH364bYdZmWrSyLGMxY4K37SymQVYQ";
  
    const embed = new EmbedBuilder()
      .setColor(CONSTANTS.COLORS.PRIMARY)
      .setTitle("☕ Support the Bot!")
      .setDescription(
        `If you enjoy using the bot and want to support development, consider sending a tip! 🎉\n\n` +
        `All **ADX** received will be **max staked**.\n\n` +
        `**Tip Address:**\n${formatters.codeBlock(tipAddress)}`
      )
      .setFooter({ text: "Thank you for your support!" });
  
    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  }