import { Client, TextChannel } from "discord.js";
import { fetchPosition } from "../utils/api";
import { config } from "../config";
import { formatters } from "../utils/formatters";
import { formatEntryPrice } from "../commands/track";
import { DatabaseService } from "./database";

interface TrackedPosition {
  positionId: number;
  wallet: string;
  userIds: Set<string>;
  lastStatus: string;
  symbol: string;
  side: string;
  entry_price: number;
  entry_leverage: number;
}

export class PositionTracker {
  private client: Client;
  private db: DatabaseService;
  private updateInterval: NodeJS.Timeout | null = null;
  private static instance: PositionTracker | null = null;

  constructor(client: Client) {
    this.client = client;
    this.db = DatabaseService.getInstance();
    this.startTracking();
  }

  static getInstance(client?: Client): PositionTracker {
    if (!PositionTracker.instance && client) {
      PositionTracker.instance = new PositionTracker(client);
    }
    if (!PositionTracker.instance) {
      throw new Error("PositionTracker not initialized");
    }
    return PositionTracker.instance;
  }

  addPosition(
    positionId: number,
    wallet: string,
    userId: string,
    symbol: string,
    side: string,
    entry_price: number,
    entry_leverage: number
  ): boolean {
    return this.db.addPosition({
      positionId,
      wallet,
      symbol,
      side,
      entry_price,
      entry_leverage,
      userId,
    });
  }

  removeUserFromPosition(positionId: number, userId: string): boolean {
    return this.db.removeUserFromPosition(positionId, userId);
  }

  getUserTrackedPositions(userId: string): TrackedPosition[] {
    return this.db.getUserPositions(userId);
  }

  getAllTrackedPositions(): TrackedPosition[] {
    return this.db.getAllPositions();
  }

  private async getNotificationChannel(): Promise<TextChannel> {
    const channel = await this.client.channels.fetch(
      config.POSITION_NOTIFICATION_CHANNEL
    );
    if (!channel || !(channel instanceof TextChannel)) {
      throw new Error(
        "Position notification channel not found or is not a text channel"
      );
    }
    return channel;
  }

  private async checkPositions() {
    try {
      const notificationChannel = await this.getNotificationChannel();
      console.log(`Checking tracked positions...`);

      const positions = await this.db.getAllPositions();

      for (const tracked of positions) {
        console.log(
          `Checking position ${tracked.positionId}: ${tracked.symbol} ${tracked.side}`
        );

        try {
          const position = await fetchPosition(
            tracked.positionId,
            tracked.wallet
          );

          if (!position) {
            console.warn(
              `Could not fetch position ${tracked.positionId} for wallet ${tracked.wallet}`
            );
            continue;
          }

          console.log(
            `Position ${tracked.positionId} status: ${position.status} (previous: ${tracked.lastStatus})`
          );

          if (position.status !== tracked.lastStatus) {
            const userMentions = Array.from(tracked.userIds)
              .map((id) => `<@${id}>`)
              .join(" ");

            console.log(
              `Status changed for position ${
                tracked.positionId
              }. Notifying users: ${Array.from(tracked.userIds).join(", ")}`
            );

            await notificationChannel.send(
              `${userMentions}\n` +
                `Position Update: ${
                  position.symbol
                } ${position.side.toUpperCase()} status has been changed to ${
                  position.status
                }\n` +
                `🔗 Trader: \`${formatters.walletAddress(tracked.wallet)}\`\n` +
                `💰 Entry: \`$${formatEntryPrice(
                  tracked.entry_price,
                  position.symbol
                )}\``
            );

            if (position.status !== "open") {
              console.log(
                `Removing closed position ${tracked.positionId} from tracking`
              );
              this.db.removePosition(tracked.positionId);
            } else {
              console.log(
                `Updating status for position ${tracked.positionId} to ${position.status}`
              );
              this.db.updatePositionStatus(tracked.positionId, position.status);
            }
          }
        } catch (error) {
          console.error(
            `Error checking position ${tracked.positionId}:`,
            error
          );
        }
      }

      console.log("Position check completed");
    } catch (error) {
      console.error("Error in checkPositions:", error);
    }
  }

  private startTracking() {
    console.log(
      `Starting position tracker with ${config.POSITION_CHECK_INTERVAL} second interval`
    );
    this.updateInterval = setInterval(
      () => this.checkPositions(),
      config.POSITION_CHECK_INTERVAL * 1000
    );
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}
