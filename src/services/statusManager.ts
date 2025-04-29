import { Client, ActivityType } from "discord.js";
import { fetchTokenPrice, fetchTokenPrices } from "../utils/api";
import { TokenType } from "../utils/types";
import { config } from "../config";

export class StatusManager {
  private client: Client;
  private readonly tokens: TokenType[];
  private updateInterval: NodeJS.Timeout | null;

  constructor(client: Client) {
    this.client = client;
    this.tokens = ["ADX", "ALP"];
    this.updateInterval = null;
  }

  async updateBotStatus(): Promise<void> {
    try {
      console.log(`Attempting to update status...`);
      const prices = await fetchTokenPrices();

      if (prices !== null && this.client.user) {
        const adxPrice =
          prices.adx !== null ? `$${Number(prices.adx).toFixed(4)}` : "N/A";
        const alpPrice =
          prices.alp !== null ? `$${Number(prices.alp).toFixed(4)}` : "N/A";

        const formattedPrice = `ADX ${adxPrice} / ALP ${alpPrice}`;

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
        const status = `Tracking ADX and ALP`;
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
    this.updateBotStatus();

    // Set up the interval
    this.updateInterval = setInterval(() => {
      this.updateBotStatus();
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
