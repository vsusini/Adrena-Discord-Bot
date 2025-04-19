import {
  ChatInputCommandInteraction,
  MessageFlags,
  EmbedBuilder,
} from "discord.js";
import { readAdrenaAccount } from "../utils/solanaUtils";
import { getNextStakingRoundStartTime } from "../utils/timeUtils";
import { BN } from "@coral-xyz/anchor";
import { formatters } from "../utils/formatters";
import { CONSTANTS } from "../utils/constants";

const STAKING_ACCOUNT = CONSTANTS.ACCOUNTS.STAKING;

export async function handleRewardsCommand(
  interaction: ChatInputCommandInteraction
) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const accountData = await readAdrenaAccount(STAKING_ACCOUNT);

    if (accountData && accountData.summary) {
      const { pendingUsdcRewards, stakingType, currentStakingRound } =
        accountData.summary;
      const formattedRewards = formatters.usdValue(pendingUsdcRewards);

      const startTimeSeconds = Math.floor(
        new Date(currentStakingRound.startTime).getTime() / 1000
      );
      const nextRoundTime =
        getNextStakingRoundStartTime(new BN(startTimeSeconds)).getTime() / 1000;
      const roundEndTimestamp = Math.floor(nextRoundTime);

      const embed = new EmbedBuilder()
        .setColor(CONSTANTS.COLORS.PRIMARY)
        .setTitle(`🏦 ${stakingType} Staking Account Details`)
        .setURL(CONSTANTS.URLS.MONITORING)
        .setThumbnail(CONSTANTS.IMAGES.LOGO)
        .addFields({
          name: "💰 Rewards Summary",
          value: formatters.rewardsSummary(pendingUsdcRewards, roundEndTimestamp),
          inline: false,
        });

      await interaction.editReply({ embeds: [embed] });
    } else {
      console.warn("No staking summary found");
      await interaction.editReply({
        content: "Unable to fetch rewards data from staking account",
      });
    }
  } catch (error) {
    console.error("Error fetching rewards data:", error);
    await interaction.editReply({
      content: "An error occurred while fetching the rewards data",
    });
  }
}
