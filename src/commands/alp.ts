import {
  ChatInputCommandInteraction,
  MessageFlags,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { CONSTANTS } from "../utils/constants";
import { formatters } from "../utils/formatters";

interface PoolInfoResponse {
  success: boolean;
  data: {
    snapshot_timestamp: string[];
    startDate: string;
    endDate: string;
    aum_usd: number[];
    lp_token_price: number[];
    lp_apr_rolling_seven_day: number[];
  };
}

interface FeesResponse {
  success: boolean;
  data: {
    snapshot_timestamp: string[];
    cumulative_liquidity_fee_usd: number[];
  };
}

async function fetchPoolInfo(): Promise<PoolInfoResponse | null> {
  try {
    const response = await fetch(
      "https://datapi.adrena.xyz/poolinfo?aum_usd=true&lp_token_price=true&lp_apr_rolling_seven_day=true&sort=DESC&limit=1"
    );

    if (!response.ok) {
      console.error("Failed to fetch pool info:", response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching pool info:", error);
    return null;
  }
}

async function fetchCurrentFees(): Promise<FeesResponse | null> {
  try {
    const response = await fetch(
      "https://datapi.adrena.xyz/poolinfo?cumulative_liquidity_fee_usd=true&sort=DESC&limit=1"
    );

    if (!response.ok) {
      console.error("Failed to fetch current fees:", response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching current fees:", error);
    return null;
  }
}

async function fetchDailyFees(): Promise<FeesResponse | null> {
  try {
    const response = await fetch(
      "https://datapi.adrena.xyz/poolinfodaily?cumulative_liquidity_fee_usd=true&sort=DESC&limit=1"
    );

    if (!response.ok) {
      console.error("Failed to fetch daily fees:", response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching daily fees:", error);
    return null;
  }
}

export const command = new SlashCommandBuilder()
  .setName("alp")
  .setDescription("Get ALP token price, APR, and TVL information");

export async function handleAlpCommand(
  interaction: ChatInputCommandInteraction
) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const [poolInfo, currentFees, dailyFees] = await Promise.all([
      fetchPoolInfo(),
      fetchCurrentFees(),
      fetchDailyFees(),
    ]);

    if (!poolInfo?.success || !currentFees?.success || !dailyFees?.success) {
      await interaction.editReply(
        "Failed to fetch ALP information. Please try again later."
      );
      return;
    }

    const {
      lp_token_price: [price],
      lp_apr_rolling_seven_day: [apr],
      aum_usd: [tvl],
      snapshot_timestamp: [timestamp],
    } = poolInfo.data;

    const currentFee = currentFees.data.cumulative_liquidity_fee_usd[0];
    const previousFee = dailyFees.data.cumulative_liquidity_fee_usd[0];
    const dailyFeeTotal = currentFee - previousFee;

    const formattedPrice = `$${price.toFixed(4)}`;
    const formattedApr = `${apr.toFixed(2)}%`;
    const formattedTvl = formatters.usdValue(tvl);
    const formattedDailyFees = formatters.usdValue(dailyFeeTotal.toString());

    const embed = new EmbedBuilder()
      .setColor("#562bc1")
      .setTitle("🟪 ALP Token Information")
      .setThumbnail(CONSTANTS.IMAGES.ALP_LOGO)
      .addFields(
        { name: "💰 Price", value: `\`${formattedPrice}\``, inline: true },
        { name: "📈 7-Day APR", value: `\`${formattedApr}\``, inline: true },
        { name: "\u200B", value: "\u200B", inline: true },
        {
          name: "💸 24h Mint/Redeem Fees",
          value: `\`$${formattedDailyFees}\``,
          inline: false,
        },
        { name: "💎 TVL", value: `\`$${formattedTvl}\``, inline: false }
      );

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Error in /alp command:", error);
    await interaction.editReply({
      content: "An error occurred while fetching ALP information.",
    });
  }
}
