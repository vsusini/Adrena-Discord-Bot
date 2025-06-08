import {
  ChatInputCommandInteraction,
  MessageFlags,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { CONSTANTS } from "../utils/constants";
import { fetchTokenPrice } from "../utils/api";

interface AprResponse {
  success: boolean;
  data: {
    start_date: string;
    end_date: string;
    aprs: {
      staking_type: string;
      lock_period: number;
      locked_usdc_apr: number;
      locked_adx_apr: number;
      total_apr: number;
    }[];
  };
}

async function fetchStakingApr(): Promise<AprResponse | null> {
  try {
    const response = await fetch(
      "https://datapi.adrena.xyz/apr?staking_type=lm"
    );

    if (!response.ok) {
      console.error("Failed to fetch APR info:", response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching APR info:", error);
    return null;
  }
}

function formatApr(usdc: number, adx: number, total: number): string {
  return [
    `USDC: \`${usdc.toFixed(2)}%\``,
    `ADX: \`${adx.toFixed(2)}%\``,
    `Total: \`${total.toFixed(2)}%\``,
  ].join("\n");
}

export const command = new SlashCommandBuilder()
  .setName("adx")
  .setDescription("Get ADX token price and staking APR information");

export async function handleAdxCommand(
  interaction: ChatInputCommandInteraction
) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const [price, aprInfo] = await Promise.all([
      fetchTokenPrice("ADX"),
      fetchStakingApr(),
    ]);

    if (!price || !aprInfo?.success) {
      await interaction.editReply(
        "Failed to fetch ADX information. Please try again later."
      );
      return;
    }

    const formattedPrice = `$${Number(price).toFixed(4)}`;
    const aprData = aprInfo.data.aprs.reduce((acc, apr) => {
      acc[apr.lock_period] = {
        usdc: apr.locked_usdc_apr,
        adx: apr.locked_adx_apr,
        total: apr.total_apr,
      };
      return acc;
    }, {} as Record<number, { usdc: number; adx: number; total: number }>);

    const embed = new EmbedBuilder()
      .setColor(CONSTANTS.COLORS.PRIMARY)
      .setTitle("🟥 ADX Token Information")
      .setThumbnail(CONSTANTS.IMAGES.LOGO)
      .addFields(
        {
          name: "💰 Price",
          value: `\`${formattedPrice}\``,
          inline: false,
        },
        {
          name: "📈 Staking APR",
          value: "Different lock periods yield different APRs",
          inline: false,
        },
        {
          name: "No Lock",
          value: `${formatApr(
            aprData[0].usdc,
            aprData[0].adx,
            aprData[0].total
          )}`,
          inline: true,
        },
        {
          name: "90 Days",
          value: `${formatApr(
            aprData[90].usdc,
            aprData[90].adx,
            aprData[90].total
          )}`,
          inline: true,
        },
        {
          name: "180 Days",
          value: `${formatApr(
            aprData[180].usdc,
            aprData[180].adx,
            aprData[180].total
          )}`,
          inline: true,
        },
        {
          name: "360 Days",
          value: `${formatApr(
            aprData[360].usdc,
            aprData[360].adx,
            aprData[360].total
          )}`,
          inline: true,
        },
        {
          name: "540 Days",
          value: `${formatApr(
            aprData[540].usdc,
            aprData[540].adx,
            aprData[540].total
          )}`,
          inline: true,
        }
      );

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Error in /adx command:", error);
    await interaction.editReply({
      content: "An error occurred while fetching ADX information.",
    });
  }
}
