import { Client, TextChannel, EmbedBuilder, ColorResolvable } from "discord.js";
import { readAdrenaAccount } from "../utils/solanaUtils";
import { getNextStakingRoundStartTime } from "../utils/timeUtils";
import { config } from "../config";
import { BN } from "@coral-xyz/anchor";
import { CONSTANTS } from "../utils/constants";
import { formatters } from "../utils/formatters";

export class RewardsManager {
  private client: Client;
  private updateInterval: NodeJS.Timeout | null;
  private readonly STAKING_ACCOUNT = CONSTANTS.ACCOUNTS.STAKING;

  constructor(client: Client) {
    this.client = client;
    this.updateInterval = null;
  }

  async checkAndNotifyRewards(): Promise<void> {
    try {
      const channel = (await this.client.channels.fetch(
        config.REWARDS_NOTIFICATION_CHANNEL
      )) as TextChannel;
      if (!channel) {
        console.error("Rewards notification channel not found");
        return;
      }

      const accountData = await readAdrenaAccount(this.STAKING_ACCOUNT);

      if (accountData?.summary) {
        const {
          pendingUsdcRewards,
          stakingType,
          currentStakingRound,
          totalStaked,
          percentageStaked,
        } = accountData.summary;

        const formattedRewards = formatters.usdValue(pendingUsdcRewards);
        const formattedTotalStaked = formatters.usdValue(totalStaked);
        const nextRoundTime =
          getNextStakingRoundStartTime(
            new BN(
              Math.floor(
                new Date(currentStakingRound.startTime).getTime() / 1000
              )
            )
          ).getTime() / 1000;
        const timeRemaining = nextRoundTime * 1000 - Date.now();

        // Only notify if time remaining is positive and less than threshold
        if (
          timeRemaining > 0 &&
          timeRemaining < config.REWARDS_NOTIFICATION_THRESHOLD * 1000
        ) {
          const roundEndTimestamp = Math.floor(nextRoundTime);

          const embed = new EmbedBuilder()
            .setColor(CONSTANTS.COLORS.PRIMARY as ColorResolvable)
            .setTitle(`🚨 ${stakingType} Staking Rewards Round Ending Soon!`)
            .setURL(CONSTANTS.URLS.MONITORING)
            .setThumbnail(CONSTANTS.IMAGES.LOGO)
            .addFields(
              {
                name: "💰 Rewards Summary",
                value: formatters.rewardsSummary(pendingUsdcRewards, roundEndTimestamp),
                inline: false,
              },
              {
                name: "📊 Pool Statistics",
                value: `Total Staked: \`${formattedTotalStaked}\`\nPercentage Staked: \`${percentageStaked}\``,
                inline: false,
              }
            );

          await channel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error("Error checking rewards:", error);
    }
  }

  startRewardsLoop(): void {
    console.log("Starting rewards check loop...");

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Immediate first check
    this.checkAndNotifyRewards();

    // Set up the interval
    this.updateInterval = setInterval(() => {
      this.checkAndNotifyRewards();
    }, config.REWARDS_CHECK_INTERVAL * 1000);

    console.log(
      `Rewards check loop initialized with ${config.REWARDS_CHECK_INTERVAL} second interval`
    );
  }

  stopRewardsLoop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log("Rewards check loop stopped");
    }
  }
}
