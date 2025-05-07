import {
  ChatInputCommandInteraction,
  MessageFlags,
  EmbedBuilder,
  SlashCommandBuilder,
  APIEmbedField,
} from "discord.js";
import { CONSTANTS } from "../utils/constants";
import { formatters } from "../utils/formatters";

const custodyMap = {
  BTC: "GFu3qS22mo6bAjg4Lr5R7L8pPgHq6GvbjJPKEHkbbs2c",
  BONK: "8aJuzsgjxBnvRhDcfQBD7z4CUj7QoPEpaNwVd7KqsSk5",
  SOL: "GZ9XfWwgTRhkma2Y91Q9r1XKotNXYjBnKKabj19rhT71",
  USDC: "Dk523LZeDQbZtUwPEBjFXCd2Au1tD7mWZBJJmcgHktNk",
};

export const command = new SlashCommandBuilder()
  .setName("liquidity")
  .setDescription("View the latest locked and available liquidity by token");

export async function handleLiquidityCommand(
  interaction: ChatInputCommandInteraction
) {
  await interaction.deferReply();
  console.log(`Fetching liquidity data...`);

  try {
    const now = new Date().toISOString();
    const url = `https://datapi.adrena.xyz/custodyinfo?owned=true&locked=true&trade_price=true&end_date=${now}&page=1&limit=9000`;

    const res = await fetch(url);
    const json = await res.json();

    const { snapshot_timestamp, owned, locked, trade_price } = json.data;
    const latestTimestamp = snapshot_timestamp.at(-1);

    const fields: APIEmbedField[] = Object.entries(custodyMap).map(
      ([token, custodyId]) => {
        const ownedVal = owned[custodyId]?.at(-1) || 0;
        const lockedVal = locked[custodyId]?.at(-1) || 0;
        const price = trade_price[custodyId]?.at(-1) || 0;

        const remainingLiquidity = (ownedVal - lockedVal) * price;
        const lockedPercent = ownedVal > 0 ? (lockedVal / ownedVal) * 100 : 0;

        return {
          name: token,
          value:
            `Remaining Liquidity: ${formatters.codeBlock(
              "$"+formatters.usdValue(remainingLiquidity)
            )}\n` +
            `Locked: ${formatters.codeBlock(
              formatters.usdValue(lockedPercent) + "%"
            )}`,
          inline: true,
        };
      }
    );

    const embed = new EmbedBuilder()
      .setColor(CONSTANTS.COLORS.PRIMARY)
      .setTitle("🔒 Liquidity Snapshot")
      .setDescription("Most recent custody info by token")
      .addFields(fields)
      .addFields({
        name: "\u200B",
        value: `📸 Snapshot taken at <t:${Math.floor(
          new Date(latestTimestamp).getTime() / 1000
        )}:F>`,
        inline: false,
      });
    //   .setFooter({
    //     text: `Snapshot taken: <t:${Math.floor(new Date(latestTimestamp).getTime())}:F>`,
    //   });

    console.log("Liquidity data successfully fetched.");
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Error fetching liquidity data:", error);
    await interaction.editReply({
      content:
        "An error occurred while fetching liquidity data. Please try again later.",
    });
  }
}
