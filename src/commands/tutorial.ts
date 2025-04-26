import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    MessageFlags,
  } from "discord.js";
  import { CONSTANTS } from "../utils/constants";
  
  export const command = new SlashCommandBuilder()
    .setName("tutorial")
    .setDescription("Step-by-step guide on setting up position tracking");
  
  export async function handleTutorialCommand(
    interaction: ChatInputCommandInteraction
  ) {
    const step1 = new EmbedBuilder()
      .setColor(CONSTANTS.COLORS.PRIMARY)
      .setTitle("🧪 Step 1: Track a Wallet")
      .setDescription("Use `/position-track <wallet>` to paste the wallet address of the trader you want to track.")
      .setImage("https://i.imgur.com/u9BgoIs.png");
  
    const step2 = new EmbedBuilder()
      .setColor(CONSTANTS.COLORS.PRIMARY)
      .setTitle("🧪 Step 2: Select Open Positions")
      .setDescription("The bot will show a list of active positions — pick which one you want to follow.")
      .setImage("https://i.imgur.com/6KYqocY.png");
  
    const step3 = new EmbedBuilder()
      .setColor(CONSTANTS.COLORS.PRIMARY)
      .setTitle("🧪 Step 3: Monitor Positions")
      .setDescription("Use `/position-status` to view the status of all tracked positions.")
      .setImage("https://i.imgur.com/pmr4628.png");
  
    const step4 = new EmbedBuilder()
      .setColor(CONSTANTS.COLORS.PRIMARY)
      .setTitle("🧪 Step 4: Untrack if Needed")
      .setDescription("Use `/position-untrack` to stop following a position.")
      .setImage("https://i.imgur.com/41cXvO7.png");
    
    const step5 = new EmbedBuilder()
      .setColor(CONSTANTS.COLORS.PRIMARY)
      .setTitle("🔔 Step 5: Get Notified on Updates")
      .setDescription("You'll automatically receive a notification when a tracked position updates!")
      .setImage("https://i.imgur.com/af6a8jS.png");
  
    await interaction.reply({
      embeds: [step1, step2, step3, step4, step5],
    });
  }