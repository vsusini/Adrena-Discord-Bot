import {
  ChatInputCommandInteraction,
  MessageFlags,
  EmbedBuilder,
  ColorResolvable,
  APIEmbedField,
  SlashCommandBuilder,
} from "discord.js";
import { fetchMutagenData } from "../utils/api";
import { CommandOption } from "../utils/types";
import { CONSTANTS } from "../utils/constants";
import { formatters } from "../utils/formatters";

export const command = new SlashCommandBuilder()
  .setName("mutagen")
  .setDescription("Get mutagen points and rank for a wallet")
  .addStringOption((option) =>
    option
      .setName("wallet")
      .setDescription("The wallet address to check")
      .setRequired(true)
  );

export async function handleMutagenCommand(
  interaction: ChatInputCommandInteraction
) {
  const walletOption = interaction.options.get("wallet") as CommandOption;
  const wallet = walletOption?.value;

  if (!wallet) {
    console.warn(`Invalid wallet address request from ${interaction.user.tag}`);
    await interaction.reply({
      content: "Please provide a valid wallet address",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  console.log(
    `Fetching mutagen data for wallet: ${wallet.slice(0, 6)}...${wallet.slice(
      -4
    )}`
  );

  try {
    const { points, rank } = await fetchMutagenData(wallet);
    if (points !== null) {
      const formattedPoints = points.toFixed(4);
      console.log(
        `Successfully fetched mutagen data for wallet ${wallet.slice(
          0,
          6
        )}...${wallet.slice(-4)}`
      );

      const embed = new EmbedBuilder()
        .setColor(CONSTANTS.COLORS.PRIMARY)
        .setTitle("🧬 Mutagen")
        .setURL(CONSTANTS.URLS.MUTAGEN_LEADERBOARD)
        .addFields(
          [
            {
              name: "👤 Wallet",
              value: formatters.codeBlock(formatters.walletAddress(wallet)),
              inline: false,
            },
            {
              name: "💉 Total Mutagen",
              value: formatters.codeBlock(formattedPoints),
              inline: true,
            },
            rank !== null
              ? {
                  name: "📊 Rank",
                  value: formatters.codeBlock(`#${rank}`),
                  inline: true,
                }
              : null,
          ].filter((field) => field !== null) as APIEmbedField[]
        );

      await interaction.editReply({ embeds: [embed] });
    } else {
      console.warn(
        `No mutagen data found for wallet ${formatters.walletAddress(wallet)}`
      );
      await interaction.editReply({
        content: `Unable to find mutagen data for wallet \`${formatters.walletAddress(
          wallet
        )}\`.\nCheck if the wallet exists on the [leaderboard](${
          CONSTANTS.URLS.MUTAGEN_LEADERBOARD
        }).`,
      });
    }
  } catch (error) {
    console.error(
      `Error in mutagen command for wallet ${formatters.walletAddress(
        wallet
      )}:`,
      error
    );
    await interaction.editReply({
      content:
        "An error occurred while fetching the data. Please try again later.",
    });
  }
}
