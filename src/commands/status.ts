import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { PositionTracker } from '../services/positionTracker';
import { formatters } from '../utils/formatters';
import { CONSTANTS } from '../utils/constants';
import { formatEntryPrice } from './track';

export const data = new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check your tracked positions');

export async function handleStatusCommand(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
        const tracker = PositionTracker.getInstance();
        const userPositions = tracker.getUserTrackedPositions(interaction.user.id);

        if (!userPositions.length) {
            await interaction.editReply('You are not tracking any positions.');
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(CONSTANTS.COLORS.PRIMARY)
            .setTitle('🔍 Your Tracked Positions')
            .addFields(
                userPositions.map(pos => ({
                    name: `${pos.symbol} ${pos.side.toUpperCase()}`,
                    value: [
                        `Wallet: \`${formatters.walletAddress(pos.wallet)}\``,
                        `Entry: \`$${formatEntryPrice(pos.entry_price, pos.symbol)}\``,
                        `Leverage: \`${pos.entry_leverage}x\``,
                        `Tracked By: ${pos.userIds.size} ${pos.userIds.size === 1 ? 'user' : 'users'}`,
                    ].join('\n'),
                    inline: true
                }))
            );

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Error in status command:', error);
        await interaction.editReply('Error fetching tracked positions. Try again later.');
    }
}