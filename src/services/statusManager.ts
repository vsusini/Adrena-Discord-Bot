import { Client, ActivityType } from "discord.js";
import { fetchTokenPrice, fetchTokenPrices } from "../utils/api";
import { TokenType } from "../utils/types";
import { config } from "../config";

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

    // Set up the interval
    this.updateInterval = setInterval(() => {
      this.currentTokenIndex =
        (this.currentTokenIndex + 1) % this.tokens.length;
      this.updateBotStatus(this.tokens[this.currentTokenIndex]);
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
