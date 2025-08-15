import { Client, ActivityType } from "discord.js";
import {
  fetchCurrentOpenInterestUSD,
  fetchDailyTradingVolumeUSD,
  fetchTokenPrices,
} from "../utils/api";
import { TokenType } from "../utils/types";
import { config } from "../config";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { formatters } from "../utils/formatters";
dayjs.extend(utc);

export class StatusManager {
  private client: Client;
  private currentTokenIndex: number;
  private readonly tokens: TokenType[];
  private updateInterval: NodeJS.Timeout | null;

  constructor(client: Client) {
    this.client = client;
    this.currentTokenIndex = 0;
    this.tokens = ["ADX", "ALP"];
    this.updateInterval = null;
  }

  /**
   * Updates the channel name to show current open interest (OI).
   * @param channelId Discord channel ID
   */
  async updateOIChannelName(channelId: string): Promise<void> {
    try {
      const today = dayjs().utc().startOf("day");
      const yesterday = today.subtract(1, "day");
      const startDate = yesterday.toISOString();
      const endDate = today.toISOString();
      const oi = await fetchCurrentOpenInterestUSD(startDate, endDate);

      if (oi !== null) {
        const formatted = formatters.usdValue(oi.totalOI);
        const newName = `Current OI - $${(oi.totalOI / 1_000_000).toFixed(2)}m`;
        await this.setChannelName(channelId, newName, formatted, "OI");
      } else {
        console.error("Could not fetch open interest.");
      }
    } catch (error) {
      console.error("Error updating OI channel name:", error);
    }
  }

  /**
   * Updates the channel name to show daily trading volume.
   * @param channelId Discord channel ID
   */
  async updateVolumeChannelName(channelId: string): Promise<void> {
    try {
      const today = dayjs().utc();
      const endDate = today.toISOString();
      const volume = await fetchDailyTradingVolumeUSD(endDate);

      if (volume !== null) {
        const formatted = formatters.usdValue(volume);
        const newName = `24hr Volume - $${(volume / 1_000_000).toFixed(
          2
        )}m`;
        await this.setChannelName(channelId, newName, formatted, "Volume");
      } else {
        console.error("Could not fetch daily trading volume.");
      }
    } catch (error) {
      console.error("Error updating volume channel name:", error);
    }
  }

  private async setChannelName(
    channelId: string,
    newName: string,
    logValue: string,
    label: string
  ) {
    const channel = await this.client.channels.fetch(channelId);
    if (channel && channel.isTextBased()) {
      // @ts-ignore
      await channel.setName(newName);
      console.log(
        `Updated channel ${channelId} to ${newName} (${logValue}) [${label}]`
      );
    }
  }

  async updateBotStatus(token: TokenType): Promise<void> {
    try {
      console.log(`Attempting to update status...`);
      const prices = await fetchTokenPrices();

      if (prices !== null && this.client.user) {
        const adxPrice =
          prices.adx !== null ? `$${Number(prices.adx).toFixed(4)}` : "N/A";
        const alpPrice =
          prices.alp !== null ? `$${Number(prices.alp).toFixed(2)}` : "N/A";

        var formattedPrice;
        if (token == "ADX") {
          formattedPrice = `ADX ${adxPrice}`;
        } else {
          formattedPrice = `ALP ${alpPrice}`;
        }

        // Update nickname in all guilds
        for (const guild of this.client.guilds.cache.values()) {
          try {
            const me = guild.members.cache.get(this.client.user.id);
            if (me) {
              await me.setNickname(formattedPrice);
            }
          } catch (err) {
            console.error(
              `Failed to update nickname in guild ${guild.name}:`,
              err
            );
          }
        }

        // Keep the existing watching status
        const status = `${token} Price`;
        await this.client.user.setActivity(status, {
          type: ActivityType.Watching,
        });

        console.log(
          `Nickname and status updated successfully: ${formattedPrice} | ${status}`
        );
      } else {
        console.error(`Failed to update status`);
      }
    } catch (error) {
      console.error(`Error updating status:`, error);
    }
  }

  startStatusLoop(): void {
    console.log("Starting status update loop...");

    // Clear any existing interval
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Immediate first update
    this.updateBotStatus(this.tokens[this.currentTokenIndex]);
    this.updateVolumeChannelName(config.VOLUME_CHANNEL_ID);
    this.updateOIChannelName(config.OI_CHANNEL_ID);

    // Set up the interval
    this.updateInterval = setInterval(() => {
      this.currentTokenIndex =
        (this.currentTokenIndex + 1) % this.tokens.length;
      this.updateBotStatus(this.tokens[this.currentTokenIndex]);
      this.updateVolumeChannelName(config.VOLUME_CHANNEL_ID);
      this.updateOIChannelName(config.OI_CHANNEL_ID);
    }, config.UPDATE_INTERVAL * 1000);

    console.log(
      `Status loop initialized with ${config.UPDATE_INTERVAL} second interval`
    );
  }

  stopStatusLoop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log("Status update loop stopped");
    }
  }
}
