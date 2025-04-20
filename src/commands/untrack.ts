import { 
    ChatInputCommandInteraction, 
    MessageFlags, 
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    ComponentType
} from 'discord.js';
import { PositionTracker } from '../services/positionTracker';
import { formatters } from '../utils/formatters';
import { formatEntryPrice } from './track';

export const command = new SlashCommandBuilder()
    .setName('untrack')
    .setDescription('Stop tracking a position');

export async function handleUntrackCommand(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
        const tracker = PositionTracker.getInstance();
        const userPositions = tracker.getUserTrackedPositions(interaction.user.id);

        if (!userPositions.length) {
            await interaction.editReply('You are not tracking any positions.');
            return;
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('untrack_position')
            .setPlaceholder('Select a position to stop tracking')
            .addOptions(
                userPositions.map(pos => ({
                    label: `${pos.symbol} ${pos.side.toUpperCase()} - ${formatters.walletAddress(pos.wallet)}`,
                    description: `Entry: $${formatEntryPrice(pos.entry_price, pos.symbol)} | Leverage: ${pos.entry_leverage}x`,
                    value: pos.positionId.toString()
                }))
            );

        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(selectMenu);

        const response = await interaction.editReply({
            content: 'Select a position to stop tracking:',
            components: [row]
        });

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 60000,
            max: 1
        });

        collector.on('collect', async (selectInteraction) => {
            const positionId = parseInt(selectInteraction.values[0]);
            const success = tracker.removeUserFromPosition(positionId, interaction.user.id);

            await selectInteraction.reply({
                content: success 
                    ? `Successfully stopped tracking position ${positionId}`
                    : `Error removing position tracking`,
                ephemeral: true
            });

            // Remove the select menu
            await interaction.editReply({
                content: 'Position untracked successfully.',
                components: []
            });
        });

        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                await interaction.editReply({
                    content: 'Selection timed out. Please try again.',
                    components: []
                });
            }
        });
    } catch (error) {
        console.error('Error in untrack command:', error);
        await interaction.editReply('Error fetching tracked positions. Try again later.');
    }
}