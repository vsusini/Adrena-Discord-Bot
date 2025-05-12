import {
  ChatInputCommandInteraction,
  MessageFlags,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { fetchTokenPrices } from "../utils/api";
import { CONSTANTS } from "../utils/constants";
import { formatters } from "../utils/formatters";
import { formatEntryPrice } from "./track";

const ALP_ADDRESS = "4yCLi5yWGzpTWMQ1iWHG5CrGYAdBkhyEdsuSugjDUqwj";
const ADX_ADDRESS = "AuQaustGiaqxRvj2gtCdrd22PBzTn8kM3kEPEkZCtuDw";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchLiquidity(address: string): Promise<number | null> {
  const token = process.env.BIRDEYE_TOKEN;

  if (!token) {
    console.warn("BirdEye API token is missing.");
    return null;
  }
  try {
    const res = await fetch(
      `https://public-api.birdeye.so/defi/price?include_liquidity=true&address=${address}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "x-chain": "solana",
          "X-API-KEY": token,
        },
      }
    );
    if (!res.ok) {
      console.warn(`BirdEye API error for ${address}: ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    return data?.success ? data.data.liquidity ?? null : null;
  } catch (err) {
    console.error(`Failed to fetch liquidity for ${address}:`, err);
    return null;
  }
}

export const command = new SlashCommandBuilder()
  .setName("price")
  .setDescription("Get the current prices and liquidity for ADX, ALP, SOL, WBTC, and BONK.");

export async function handlePriceCommand(
  interaction: ChatInputCommandInteraction
) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  console.log("Fetching prices and liquidity...");

  try {
    const [tokenPrices, jupData] = await Promise.all([
      fetchTokenPrices(),
      fetch(
        `https://lite-api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112,3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh,DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263`
      ).then((res) => res.json()),
    ]);

    // 2 seconds delay to avoid rate limiting
    // This is a workaround for the BirdEye API rate limit
    const [alpLiquidity, adxLiquidity] = await Promise.all([
      fetchLiquidity(ALP_ADDRESS),
      delay(1500).then(() => fetchLiquidity(ADX_ADDRESS)),
    ]);
    const adxPrice = Number(tokenPrices.adx);
    const alpPrice = Number(tokenPrices.alp);
    const solPrice = parseFloat(
      jupData.data["So11111111111111111111111111111111111111112"]?.price ?? "0"
    );
    const wbtcPrice = parseFloat(
      jupData.data["3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh"]?.price ?? "0"
    );
    const bonkPrice = parseFloat(
      jupData.data["DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"]?.price ?? "0"
    );

    if (adxPrice && alpPrice && solPrice) {
      const formattedADX = `$${adxPrice.toFixed(4)}`;
      const formattedALP = `$${alpPrice.toFixed(4)}`;
      const formattedSOL = `$${solPrice.toFixed(2)}`;
      const alpPerSol = alpPrice / solPrice;
      const formattedAlpSol = alpPerSol.toFixed(6);

      const formattedAlpLiquidity =
        alpLiquidity !== null ? `$${formatters.usdValue(alpLiquidity)}` : "N/A";

      const formattedAdxLiquidity =
        adxLiquidity !== null ? `$${formatters.usdValue(adxLiquidity)}` : "N/A";

      const embed = new EmbedBuilder()
        .setColor(CONSTANTS.COLORS.PRIMARY)
        .setTitle("📊 Adrena Token Prices & Liquidity")
        .addFields(
          // ALP section title
          { name: "**🟪 ALP**", value: "", inline: false },
          { name: "Price", value: `\`${formattedALP}\``, inline: true },
          {
            name: "Liquidity",
            value: `\`${formattedAlpLiquidity}\``,
            inline: true,
          },
          { name: "ALP/SOL", value: `\`${formattedAlpSol}\``, inline: true },

          // ADX section title
          { name: "**🟥 ADX **", value: "", inline: false },
          { name: "Price", value: `\`${formattedADX}\``, inline: true },
          {
            name: "Liquidity",
            value: `\`${formattedAdxLiquidity}\``,
            inline: true,
          },
          { name: "\u200B", value: "\u200B", inline: true }, // filler for layout

          // Market Tokens section title
          { name: "**📈 Market Tokens**", value: "", inline: false },
          { name: "SOL", value: `\`${formattedSOL}\``, inline: true },
          {
            name: "BTC",
            value: `\`$${formatters.usdValue(wbtcPrice)}\``,
            inline: true,
          },
          {
            name: "BONK",
            value: `\`$${formatEntryPrice(bonkPrice, "BONK")}\``,
            inline: true,
          }
        )
        .setFooter({ text: "Prices from Adrena, BirdEye, and Jupiter APIs" });

      await interaction.editReply({ embeds: [embed] });
    } else {
      console.error("Missing price data");
      await interaction.editReply({
        content: "Could not fetch all token prices at the moment.",
      });
    }
  } catch (error) {
    console.error("Error in /price command:", error);
    await interaction.editReply({
      content: "An error occurred while fetching prices and liquidity.",
    });
  }
}
